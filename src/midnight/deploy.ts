/**
 * NightRx Contract Deployment Script
 *
 * Usage:
 *   npx tsx src/midnight/deploy.ts            # local network
 *   npx tsx src/midnight/deploy.ts preprod     # preprod testnet
 */

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import * as Rx from 'rxjs';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';

(globalThis as any).WebSocket = WebSocket;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIGS = {
  local: {
    networkId: 'undeployed',
    indexer: 'http://127.0.0.1:8088/api/v3/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v3/graphql/ws',
    node: 'http://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
    // Genesis master wallet seed (from midnight-local-dev)
    seed: '0000000000000000000000000000000000000000000000000000000000000001',
  },
  preprod: {
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    seed: process.env.MIDNIGHT_SEED || '',
  },
};

type Network = keyof typeof CONFIGS;

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

function signTransactionIntents(
  tx: any,
  signFn: (payload: Uint8Array) => any,
  proofMarker: 'proof' | 'pre-proof',
) {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize(
      'signature',
      proofMarker,
      'pre-binding',
      intent.serialize(),
    );
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: any, i: number) =>
          cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer =
        cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: any, i: number) =>
          cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer =
        cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

async function main() {
  const network: Network = (process.argv[2] as Network) || 'local';
  const config = CONFIGS[network];
  if (!config) {
    console.error(`Unknown network: ${network}`);
    process.exit(1);
  }
  if (!config.seed) {
    console.error('Set MIDNIGHT_SEED env var for preprod deployment');
    process.exit(1);
  }

  console.log(`\n=== NightRx Deploy (${network}) ===\n`);

  setNetworkId(config.networkId);

  // Load compiled contract
  const zkConfigPath = path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'nightrx');
  const contractPath = path.resolve(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    console.error('Contract not compiled! Run: npm run compile');
    process.exit(1);
  }

  const contractModule = await import(contractPath);

  // Witness implementations for deployment
  // These provide private data to the ZK circuits
  const witnesses = {
    issuerSecret: (context: any): [any, Uint8Array] => {
      // Return current private state + a dummy 32-byte secret
      // Real issuer secret will be provided when calling issueCredential
      return [context.privateState, new Uint8Array(32)];
    },
    credentialData: (context: any): [any, [Uint8Array, Uint8Array]] => {
      // Return current private state + dummy credential data
      // Real credential data will be provided when calling verifyPickup
      return [context.privateState, [new Uint8Array(32), new Uint8Array(32)]];
    },
  };

  const compiledContract = (CompiledContract as any)
    .make('nightrx', contractModule.Contract)
    .pipe(
      (c: any) => (CompiledContract as any).withWitnesses(witnesses)(c),
      (CompiledContract as any).withCompiledFileAssets(zkConfigPath),
    );
  console.log('Contract loaded.');

  // Derive keys from seed
  const keys = deriveKeys(config.seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(
    keys[Roles.NightExternal],
    getNetworkId(),
  );

  // Build wallet
  const walletConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    costParameters: {
      additionalFeeOverhead: 0n,
      feeBlocksMargin: 5,
    },
  };

  console.log('Initializing wallet...');
  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg: any) =>
      ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg: any) =>
      UnshieldedWallet(cfg).startWithPublicKey(
        PublicKey.fromKeyStore(unshieldedKeystore),
      ),
    dust: (cfg: any) =>
      DustWallet(cfg).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('Wallet started. Syncing...');

  // Wait for sync
  await Rx.firstValueFrom(
    wallet
      .state()
      .pipe(Rx.throttleTime(5000), Rx.filter((s: any) => s.isSynced)),
  );

  let state: any = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s: any) => s.isSynced)),
  );

  const nightBalance =
    state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`NIGHT balance: ${nightBalance.toLocaleString()}`);

  // Register for DUST if needed
  const dustBalance = state.dust.balance
    ? state.dust.balance(new Date())
    : state.dust.walletBalance
      ? state.dust.walletBalance(new Date())
      : 0n;
  console.log(`DUST balance: ${dustBalance.toLocaleString()}`);

  if (dustBalance === 0n) {
    const nightUtxos = state.unshielded.availableCoins.filter(
      (c: any) => c.meta?.registeredForDustGeneration !== true,
    );
    if (nightUtxos.length > 0) {
      console.log('Registering for DUST...');
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        unshieldedKeystore.getPublicKey(),
        (p: Uint8Array) => unshieldedKeystore.signData(p),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
      console.log('Waiting for DUST (this can take 1-2 minutes on preprod)...');
      await Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.throttleTime(10000),
          Rx.tap((s: any) => {
            const b = s.dust.balance
              ? s.dust.balance(new Date())
              : s.dust.walletBalance
                ? s.dust.walletBalance(new Date())
                : 0n;
            console.log(`  DUST balance: ${b.toLocaleString()}, synced: ${s.isSynced}`);
          }),
          Rx.filter((s: any) => s.isSynced),
          Rx.filter((s: any) => {
            const b = s.dust.balance
              ? s.dust.balance(new Date())
              : s.dust.walletBalance
                ? s.dust.walletBalance(new Date())
                : 0n;
            return b > 0n;
          }),
        ),
      );
      console.log('DUST ready. Waiting 10s for stabilization...');
      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  // Build providers
  const syncedState: any = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s: any) => s.isSynced)),
  );

  const walletProvider = {
    getCoinPublicKey: () =>
      syncedState.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () =>
      syncedState.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys,
          dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = (payload: Uint8Array) =>
        unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) {
        signTransactionIntents(
          recipe.balancingTransaction,
          signFn,
          'pre-proof',
        );
      }
      return wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx),
  };

  const accountId = walletProvider.getCoinPublicKey();
  const storagePassword = `${Buffer.from(accountId, 'hex').toString('base64')}!`;
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'nightrx-private-state',
      accountId,
      privateStoragePasswordProvider: () => storagePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  console.log('Deploying contract (this takes 30-60 seconds)...');
  const deployed = await deployContract(providers, {
    compiledContract,
    privateStateId: 'nightrxState',
    initialPrivateState: {},
    args: [],
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log(`\n=== CONTRACT DEPLOYED ===`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network}`);

  const deploymentInfo = {
    contractAddress,
    network,
    seed: config.seed,
    deployedAt: new Date().toISOString(),
  };

  const deployPath = path.resolve(__dirname, '..', '..', 'deployment.json');
  fs.writeFileSync(deployPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Saved to deployment.json\n`);

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('DEPLOY FAILED:', err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
