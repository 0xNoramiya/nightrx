import type { Credential, ProofData } from './types';

export interface DeployedContract {
  address: string;
  registerIssuer: (issuerId: string) => Promise<void>;
  issueCredential: (issuerId: string, commitment: string) => Promise<void>;
  verifyPickup: (
    nullifier: string,
    currentTimestamp: number,
    medicationTypeHash: string,
  ) => Promise<void>;
  getDispensationCount: () => Promise<number>;
}

export function computeCommitment(credential: Credential): string {
  return `commitment:${credential.patientSecret}:${credential.medicationHash}:${credential.validFrom}:${credential.expiryDate}`;
}

export function computeNullifier(patientSecret: string, medicationHash: string): string {
  return `nullifier:${patientSecret}:${medicationHash}`;
}

export function buildProofData(credential: Credential): ProofData {
  return {
    nullifier: computeNullifier(credential.patientSecret, credential.medicationHash),
    currentTimestamp: Math.floor(Date.now() / 1000),
    medicationTypeHash: credential.medicationHash,
    credential,
  };
}
