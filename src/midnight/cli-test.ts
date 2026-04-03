/**
 * NightRx CLI Test — calls real circuits on deployed contract
 *
 * Usage: npx tsx src/midnight/cli-test.ts
 */

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import {
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
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
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import * as Rx from 'rxjs';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';

(globalThis as any).WebSocket = WebSocket;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v3/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v3/graphql/ws',
  node: 'http://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  seed: '0000000000000000000000000000000000000000000000000000000000000001',
};

// Hash helpers — same as in contract.ts
const bytes32Descriptor = new compactRuntime.CompactTypeBytes(32);
const vector2Descriptor = new compactRuntime.CompactTypeVector(2, bytes32Descriptor);
const vector3Descriptor = new compactRuntime.CompactTypeVector(3, bytes32Descriptor);

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const clean = hex.replace(/^0x/, '');
  for (let i = 0; i < Math.min(clean.length / 2, 32); i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function stringToBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode(str).slice(0, 32));
  return bytes;
}

function randomBytes32(): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

// --- Key derivation and wallet setup (same as deploy.ts) ---

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

function signTransactionIntents(tx: any, signFn: (p: Uint8Array) => any, proofMarker: 'proof' | 'pre-proof') {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize('signature', proofMarker, 'pre-binding', intent.serialize());
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_: any, i: number) => cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature);
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_: any, i: number) => cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature);
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

async function main() {
  // Read deployment info
  const deployPath = path.resolve(__dirname, '..', '..', 'deployment.json');
  if (!fs.existsSync(deployPath)) {
    console.error('No deployment.json found. Run deploy first: npm run deploy');
    process.exit(1);
  }
  const deployment = JSON.parse(fs.readFileSync(deployPath, 'utf8'));
  console.log(`\n=== NightRx CLI Test ===`);
  console.log(`Contract: ${deployment.contractAddress}\n`);

  setNetworkId(CONFIG.networkId);

  // Prepare test data
  const issuerSecretBytes = randomBytes32();
  const issuerPrefix = stringToBytes32('nightrx:issuer:');
  const issuerId = compactRuntime.persistentHash(vector2Descriptor, [issuerPrefix, issuerSecretBytes]);
  console.log(`Issuer ID: ${bytesToHex(issuerId)}`);

  const patientSecret = randomBytes32();
  const medicationHash = stringToBytes32('ARV');
  const credPrefix = stringToBytes32('nightrx:cred:');
  const nullPrefix = stringToBytes32('nightrx:null:');
  const commitment = compactRuntime.persistentHash(vector3Descriptor, [credPrefix, patientSecret, medicationHash]);
  const nullifier = compactRuntime.persistentHash(vector3Descriptor, [nullPrefix, patientSecret, medicationHash]);
  console.log(`Commitment: ${bytesToHex(commitment)}`);
  console.log(`Nullifier:  ${bytesToHex(nullifier)}\n`);

  // Load contract with witnesses
  const zkConfigPath = path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'nightrx');
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));

  // Mutable witness state — updated before each circuit call
  let currentIssuerSecret = issuerSecretBytes;
  let currentPatientSecret = patientSecret;
  let currentMedHash = medicationHash;

  const witnesses = {
    issuerSecret: (context: any): [any, Uint8Array] => {
      return [context.privateState, currentIssuerSecret];
    },
    credentialData: (context: any): [any, [Uint8Array, Uint8Array]] => {
      return [context.privateState, [currentPatientSecret, currentMedHash]];
    },
  };

  const compiledContract = (CompiledContract as any)
    .make('nightrx', contractModule.Contract)
    .pipe(
      (c: any) => (CompiledContract as any).withWitnesses(witnesses)(c),
      (CompiledContract as any).withCompiledFileAssets(zkConfigPath),
    );

  // Setup wallet
  const keys = deriveKeys(CONFIG.seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const walletConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  console.log('Initializing wallet...');
  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg: any) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg: any) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  await Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5000), Rx.filter((s: any) => s.isSynced)));
  console.log('Wallet synced.');

  const syncedState: any = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s: any) => s.isSynced)));
  const walletProvider = {
    getCoinPublicKey: () => syncedState.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => syncedState.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await wallet.balanceUnboundTransaction(tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = (payload: Uint8Array) => unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      return wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx),
  };

  const accountId = walletProvider.getCoinPublicKey();
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'nightrx-cli-test-state',
      accountId,
      privateStoragePasswordProvider: () => `${Buffer.from(accountId, 'hex').toString('base64')}!`,
    }),
    publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // Find deployed contract
  console.log('Connecting to deployed contract...');
  const contract = await findDeployedContract(providers, {
    compiledContract,
    contractAddress: deployment.contractAddress,
    privateStateId: 'nightrxCliTestState',
    initialPrivateState: {},
  });
  console.log('Connected!\n');

  // Step 1: Register issuer
  console.log('--- Step 1: Register Issuer ---');
  console.log(`Calling registerIssuer(${bytesToHex(issuerId).slice(0, 16)}...)...`);
  const regResult = await contract.callTx.registerIssuer(issuerId);
  console.log(`TX submitted. Block: ${regResult?.public?.txHash ?? 'pending'}`);
  console.log('Issuer registered!\n');

  // Step 2: Issue credential
  console.log('--- Step 2: Issue Credential ---');
  console.log(`Calling issueCredential(${bytesToHex(issuerId).slice(0, 16)}..., ${bytesToHex(commitment).slice(0, 16)}...)...`);
  const issueResult = await contract.callTx.issueCredential(issuerId, commitment);
  console.log(`TX submitted. Block: ${issueResult?.public?.txHash ?? 'pending'}`);
  console.log('Credential issued!\n');

  // Step 3: Verify pickup
  console.log('--- Step 3: Verify Pickup ---');
  console.log(`Calling verifyPickup(${bytesToHex(nullifier).slice(0, 16)}..., ${bytesToHex(medicationHash).slice(0, 16)}...)...`);
  const verifyResult = await contract.callTx.verifyPickup(nullifier, medicationHash);
  console.log(`TX submitted. Block: ${verifyResult?.public?.txHash ?? 'pending'}`);
  console.log('Pickup verified!\n');

  console.log('=== ALL 3 CIRCUITS EXECUTED SUCCESSFULLY ===\n');

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('TEST FAILED:', err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
