import type { Credential, ProofData } from '../midnight/types';
import { serializeCredential, deserializeCredential } from './credential';

export interface QRPayload {
  type: 'credential' | 'proof';
  version: 1;
  data: string;
}

export function credentialToQR(credential: Credential): string {
  const payload: QRPayload = {
    type: 'credential',
    version: 1,
    data: serializeCredential(credential),
  };
  return JSON.stringify(payload);
}

export function proofToQR(proof: ProofData): string {
  const payload: QRPayload = {
    type: 'proof',
    version: 1,
    data: JSON.stringify(proof),
  };
  return JSON.stringify(payload);
}

export function parseQR(raw: string): { type: 'credential'; data: Credential } | { type: 'proof'; data: ProofData } {
  const payload: QRPayload = JSON.parse(raw);

  if (payload.version !== 1) {
    throw new Error(`Unsupported QR version: ${payload.version}`);
  }

  if (payload.type === 'credential') {
    return { type: 'credential', data: deserializeCredential(payload.data) };
  }

  if (payload.type === 'proof') {
    return { type: 'proof', data: JSON.parse(payload.data) };
  }

  throw new Error(`Unknown QR payload type: ${(payload as any).type}`);
}
