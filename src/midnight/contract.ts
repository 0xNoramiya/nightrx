import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import type { Credential, ProofData } from './types';

// Descriptor for Vector<3, Bytes<32>> — matches the contract's hash input type
const bytes32Descriptor = new compactRuntime.CompactTypeBytes(32);
const vector3Descriptor = new compactRuntime.CompactTypeVector(3, bytes32Descriptor);

// Domain separator prefixes (padded to 32 bytes, matching the contract's pad(32, "..."))
const CRED_PREFIX = new Uint8Array(32);
const NULL_PREFIX = new Uint8Array(32);
const ISSUER_PREFIX = new Uint8Array(32);

// Encode "nightrx:cred:" into bytes
const credBytes = new TextEncoder().encode('nightrx:cred:');
CRED_PREFIX.set(credBytes);

// Encode "nightrx:null:" into bytes
const nullBytes = new TextEncoder().encode('nightrx:null:');
NULL_PREFIX.set(nullBytes);

// Encode "nightrx:issuer:" into bytes
const issuerBytes = new TextEncoder().encode('nightrx:issuer:');
ISSUER_PREFIX.set(issuerBytes);

export interface DeployedContract {
  address: string;
  registerIssuer: (issuerId: Uint8Array) => Promise<void>;
  issueCredential: (issuerId: Uint8Array, commitment: Uint8Array) => Promise<void>;
  verifyPickup: (nullifier: Uint8Array, medicationTypeHash: Uint8Array) => Promise<void>;
  getDispensationCount: () => Promise<number>;
}

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
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.slice(0, 32));
  return bytes;
}

export function computeIssuerIdFromSecret(secret: string): string {
  const secretBytes = hexToBytes(secret);
  const hash = compactRuntime.persistentHash(
    new compactRuntime.CompactTypeVector(2, bytes32Descriptor),
    [ISSUER_PREFIX, secretBytes],
  );
  return bytesToHex(hash);
}

export function computeCommitment(credential: Credential): string {
  const patientSecretBytes = hexToBytes(credential.patientSecret);
  const medHashBytes = hexToBytes(credential.medicationHash);
  const hash = compactRuntime.persistentHash(vector3Descriptor, [
    CRED_PREFIX,
    patientSecretBytes,
    medHashBytes,
  ]);
  return bytesToHex(hash);
}

export function computeNullifier(patientSecret: string, medicationHash: string): string {
  const patientSecretBytes = hexToBytes(patientSecret);
  const medHashBytes = hexToBytes(medicationHash);
  const hash = compactRuntime.persistentHash(vector3Descriptor, [
    NULL_PREFIX,
    patientSecretBytes,
    medHashBytes,
  ]);
  return bytesToHex(hash);
}

export function buildProofData(credential: Credential): ProofData {
  return {
    nullifier: computeNullifier(credential.patientSecret, credential.medicationHash),
    currentTimestamp: Math.floor(Date.now() / 1000),
    medicationTypeHash: credential.medicationHash,
    credential,
  };
}

// Utility exports for components that need byte conversion
export { hexToBytes, bytesToHex, stringToBytes32 };
