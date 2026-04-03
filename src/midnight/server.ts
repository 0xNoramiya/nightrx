/**
 * NightRx Backend Server
 *
 * Thin HTTP server that bridges the React frontend to the Midnight SDK.
 * The SDK requires Node.js APIs (LevelDB, WebSocket, fs) that don't work
 * in the browser, so this server handles wallet management and circuit calls.
 *
 * Usage: npx tsx src/midnight/server.ts
 */

import http from 'node:http';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
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
const PORT = 3001;

const CONFIG = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v3/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v3/graphql/ws',
  node: 'http://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  seed: '0000000000000000000000000000000000000000000000000000000000000001',
};

// --- Wallet/provider setup (same pattern as deploy.ts) ---

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

// --- Mutable witness state (updated before each circuit call) ---
let currentIssuerSecret = new Uint8Array(32);
let currentPatientSecret = new Uint8Array(32);
let currentMedHash = new Uint8Array(32);

async function init() {
  const deployPath = path.resolve(__dirname, '..', '..', 'deployment.json');
  if (!fs.existsSync(deployPath)) {
    console.error('No deployment.json. Run: npm run deploy');
    process.exit(1);
  }
  const deployment = JSON.parse(fs.readFileSync(deployPath, 'utf8'));

  setNetworkId(CONFIG.networkId);

  const zkConfigPath = path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'nightrx');
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));

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
      privateStateStoreName: 'nightrx-server-state',
      accountId,
      privateStoragePasswordProvider: () => `${Buffer.from(accountId, 'hex').toString('base64')}!`,
    }),
    publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  console.log('Connecting to contract...');
  const contract = await findDeployedContract(providers, {
    compiledContract,
    contractAddress: deployment.contractAddress,
    privateStateId: 'nightrxServerState',
    initialPrivateState: {},
  });
  console.log('Connected to contract:', deployment.contractAddress);

  return contract;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const clean = hex.replace(/^0x/, '');
  for (let i = 0; i < Math.min(clean.length / 2, 32); i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function startServer() {
  const contract = await init();

  const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }

    let body = '';
    for await (const chunk of req) body += chunk;
    const data = JSON.parse(body);

    try {
      if (req.url === '/api/register-issuer') {
        const issuerId = hexToBytes(data.issuerId);
        console.log(`[API] registerIssuer(${data.issuerId.slice(0, 16)}...)`);
        const result = await contract.callTx.registerIssuer(issuerId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, txHash: result?.public?.txHash ?? null }));

      } else if (req.url === '/api/issue-credential') {
        const issuerId = hexToBytes(data.issuerId);
        const commitment = hexToBytes(data.commitment);
        currentIssuerSecret = hexToBytes(data.issuerSecret);
        console.log(`[API] issueCredential(${data.issuerId.slice(0, 16)}..., ${data.commitment.slice(0, 16)}...)`);
        const result = await contract.callTx.issueCredential(issuerId, commitment);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, txHash: result?.public?.txHash ?? null }));

      } else if (req.url === '/api/verify-pickup') {
        const nullifier = hexToBytes(data.nullifier);
        const medicationTypeHash = hexToBytes(data.medicationTypeHash);
        currentPatientSecret = hexToBytes(data.patientSecret);
        currentMedHash = medicationTypeHash;
        console.log(`[API] verifyPickup(${data.nullifier.slice(0, 16)}..., ${data.medicationTypeHash.slice(0, 16)}...)`);
        const result = await contract.callTx.verifyPickup(nullifier, medicationTypeHash);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, txHash: result?.public?.txHash ?? null }));

      } else if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, connected: true }));

      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } catch (err: any) {
      console.error(`[API ERROR] ${req.url}:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  });

  server.listen(PORT, () => {
    console.log(`\nNightRx API server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  POST /api/register-issuer    { issuerId }');
    console.log('  POST /api/issue-credential   { issuerId, commitment, issuerSecret }');
    console.log('  POST /api/verify-pickup      { nullifier, medicationTypeHash, patientSecret }');
    console.log('  POST /api/status\n');
  });
}

startServer().catch((err) => {
  console.error('Server failed:', err.message);
  process.exit(1);
});
