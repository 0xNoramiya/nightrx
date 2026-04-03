export interface Credential {
  issuerId: string;
  patientSecret: string;
  medicationType: string;
  medicationHash: string;
  validFrom: number;
  expiryDate: number;
}

export interface ProofData {
  nullifier: string;
  currentTimestamp: number;
  medicationTypeHash: string;
  credential: Credential;
}

export interface VerificationResult {
  valid: boolean;
  medicationType: string;
  error?: string;
}

export type Role = 'clinic' | 'patient' | 'pharmacy';

export const MEDICATION_TYPES = [
  { label: 'Antiretroviral (ARV)', value: 'ARV' },
  { label: 'Pre-Exposure Prophylaxis (PrEP)', value: 'PrEP' },
  { label: 'STI Treatment', value: 'STI-Treatment' },
  { label: 'Mental Health Medication', value: 'MH-Med' },
  { label: 'Addiction Treatment', value: 'Addiction-Tx' },
] as const;
