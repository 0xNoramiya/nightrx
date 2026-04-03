/**
 * NightRx Contract Deployment Script
 *
 * Deploys the compiled Compact contract to a Midnight network.
 *
 * Usage:
 *   npm run deploy            # Deploy to local dev network
 *   npm run deploy -- preprod  # Deploy to Preprod testnet
 *
 * Prerequisites:
 *   - Compiled contract in contracts/managed/nightrx/
 *   - Proof server running (npm run start-proof-server or docker compose up)
 *   - For preprod: funded wallet (https://faucet.preprod.midnight.network/)
 *
 * When the @midnight-ntwrk SDK packages are installed, this script will:
 * 1. Create or restore a wallet from seed
 * 2. Connect to the Midnight network
 * 3. Register for DUST tokens (gas)
 * 4. Deploy the compiled contract
 * 5. Save deployment info to deployment.json
 *
 * Integration pattern for the compiled contract:
 *
 *   import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
 *   import { CompiledContract } from '@midnight-ntwrk/compact-runtime';
 *
 *   const NightRx = await import('./contracts/managed/nightrx/contract/index.js');
 *
 *   const compiledContract = CompiledContract.make('nightrx', NightRx.Contract).pipe(
 *     CompiledContract.withWitnesses({
 *       issuerSecret: async (ctx) => issuerSecretKeyBytes,
 *       credentialData: async (ctx) => [patientSecret, medHash, validFrom, expiry],
 *     }),
 *     CompiledContract.withCompiledFileAssets(zkConfigPath),
 *   );
 *
 *   const deployed = await deployContract(providers, {
 *     compiledContract,
 *     privateStateId: 'nightrxState',
 *     initialPrivateState: {},
 *   });
 *
 *   // Call circuits:
 *   await deployed.callCircuit.registerIssuer({ issuerId: bytes32 });
 *   await deployed.callCircuit.issueCredential({ issuerId, commitment });
 *   await deployed.callCircuit.verifyPickup({ nullifier, currentTimestamp, medicationTypeHash });
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNetworkConfig, type NetworkName } from './config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'nightrx');

async function main() {
  const network: NetworkName = (process.argv[2] as NetworkName) || 'local';
  const config = getNetworkConfig(network);

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║     NightRx — Deploy to ${network.padEnd(8)}              ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  console.log(`Network:      ${network}`);
  console.log(`Node:         ${config.node}`);
  console.log(`Indexer:      ${config.indexer}`);
  console.log(`Proof Server: ${config.proofServer}\n`);

  // Check compiled contract exists
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract not compiled!');
    console.error('   Run: npm run compile');
    console.error(`   Expected: ${contractPath}\n`);
    process.exit(1);
  }

  console.log('✅ Compiled contract found\n');

  // When @midnight-ntwrk packages are available, the full deployment flow goes here:
  // 1. Generate or restore wallet seed
  // 2. Derive keys (HD wallet)
  // 3. Create wallet (shielded + unshielded + dust)
  // 4. Fund wallet if needed
  // 5. Register for DUST
  // 6. Deploy contract
  // 7. Save deployment.json

  console.log('⚠️  Full deployment requires @midnight-ntwrk SDK packages.');
  console.log('   Install them with access to the Midnight npm registry:\n');
  console.log('   npm config set @midnight-ntwrk:registry https://npm.midnight.network/');
  console.log('   npm install @midnight-ntwrk/midnight-js-contracts @midnight-ntwrk/wallet-sdk-hd ...\n');

  console.log('   For local development: npm run docker:up\n');
  console.log('   For preprod testnet:');
  console.log('   - Fund wallet: https://faucet.preprod.midnight.network/');
  console.log('   - Set MIDNIGHT_SEED env var with your wallet seed\n');

  // Save placeholder deployment info
  const deploymentInfo = {
    network,
    contractAddress: null,
    note: 'Deployment requires @midnight-ntwrk SDK packages',
    config: {
      node: config.node,
      indexer: config.indexer,
      proofServer: config.proofServer,
    },
    createdAt: new Date().toISOString(),
  };

  const deploymentPath = path.resolve(__dirname, '..', '..', 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment config saved to deployment.json\n`);
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
