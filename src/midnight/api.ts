const API_BASE = '';
let isOnChain: boolean | null = null;

async function post(endpoint: string, data: Record<string, string>) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  // Guard against HTML responses (nginx 502/404 when backend is down)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Backend not available');
  }
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API call failed');
  return json;
}

export async function checkServerStatus(): Promise<boolean> {
  try {
    const res = await post('/api/status', {});
    isOnChain = res.connected;
    return res.connected;
  } catch {
    isOnChain = false;
    return false;
  }
}

function simulateTx(label: string): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hash = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  console.log(`[DEMO] ${label} — simulated tx: ${hash.slice(0, 16)}...`);
  return hash;
}

export async function registerIssuerOnChain(issuerId: string): Promise<string> {
  if (isOnChain === false) {
    await new Promise((r) => setTimeout(r, 1500));
    return simulateTx('registerIssuer');
  }
  const res = await post('/api/register-issuer', { issuerId });
  return res.txHash;
}

export async function issueCredentialOnChain(
  issuerId: string,
  commitment: string,
  issuerSecret: string,
): Promise<string> {
  if (isOnChain === false) {
    await new Promise((r) => setTimeout(r, 1500));
    return simulateTx('issueCredential');
  }
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
  if (isOnChain === false) {
    await new Promise((r) => setTimeout(r, 2000));
    return simulateTx('verifyPickup');
  }
  const res = await post('/api/verify-pickup', {
    nullifier,
    medicationTypeHash,
    patientSecret,
  });
  return res.txHash;
}
