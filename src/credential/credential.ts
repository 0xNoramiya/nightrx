import type { Credential } from '../midnight/types';
import { generateRandomSecret, hashString } from '../midnight/wallet';

export function createCredential(params: {
  issuerId: string;
  medicationType: string;
  validFrom: Date;
  expiryDate: Date;
}): Credential {
  const patientSecret = generateRandomSecret();
  const medicationHash = hashString(params.medicationType);

  return {
    issuerId: params.issuerId,
    patientSecret,
    medicationType: params.medicationType,
    medicationHash,
    validFrom: Math.floor(params.validFrom.getTime() / 1000),
    expiryDate: Math.floor(params.expiryDate.getTime() / 1000),
  };
}

export function serializeCredential(credential: Credential): string {
  return JSON.stringify(credential);
}

export function deserializeCredential(data: string): Credential {
  const parsed = JSON.parse(data);

  const required = [
    'issuerId',
    'patientSecret',
    'medicationType',
    'medicationHash',
    'validFrom',
    'expiryDate',
  ] as const;

  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Invalid credential: missing ${field}`);
    }
  }

  return parsed as Credential;
}

export function isCredentialExpired(credential: Credential): boolean {
  return Math.floor(Date.now() / 1000) > credential.expiryDate;
}

export function isCredentialActive(credential: Credential): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= credential.validFrom && now <= credential.expiryDate;
}

const CREDENTIALS_STORAGE_KEY = 'nightrx:credentials';

export function saveCredentialToStorage(credential: Credential): void {
  const existing = loadCredentialsFromStorage();
  existing.push(credential);
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(existing));
}

export function loadCredentialsFromStorage(): Credential[] {
  const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function clearCredentialsFromStorage(): void {
  localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
}
