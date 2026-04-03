export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: bigint;
  dustBalance: bigint;
}

export async function connectLaceWallet(networkId: string): Promise<{
  api: any;
  address: string;
}> {
  const midnight = (window as any).midnight;
  if (!midnight?.mnLace) {
    throw new Error(
      'Lace wallet not found. Please install the Lace browser extension.',
    );
  }

  const wallet = midnight.mnLace;
  const api = await wallet.connect(networkId);
  const addresses = await api.getShieldedAddresses();

  return {
    api,
    address: addresses.shieldedAddress,
  };
}

export function generateRandomSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function hashString(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const padded = new Uint8Array(32);
  padded.set(data.slice(0, 32));
  return Array.from(padded, (b) => b.toString(16).padStart(2, '0')).join('');
}
