/**
 * Frontend API client for NightRx backend server.
 * Calls the Node.js server which handles Midnight SDK interactions.
 */

const API_BASE = 'http://localhost:3001';

async function post(endpoint: string, data: Record<string, string>) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API call failed');
  return json;
}

export async function checkServerStatus(): Promise<boolean> {
  try {
    const res = await post('/api/status', {});
    return res.connected;
  } catch {
    return false;
  }
}

export async function registerIssuerOnChain(issuerId: string): Promise<string> {
  const res = await post('/api/register-issuer', { issuerId });
  return res.txHash;
}

export async function issueCredentialOnChain(
  issuerId: string,
  commitment: string,
  issuerSecret: string,
): Promise<string> {
  const res = await post('/api/issue-credential', {
    issuerId,
    commitment,
    issuerSecret,
  });
  return res.txHash;
}

export async function verifyPickupOnChain(
  nullifier: string,
  medicationTypeHash: string,
  patientSecret: string,
): Promise<string> {
  const res = await post('/api/verify-pickup', {
    nullifier,
    medicationTypeHash,
    patientSecret,
  });
  return res.txHash;
}
