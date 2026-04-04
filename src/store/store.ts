import { create } from 'zustand';
import type { Credential, ProofData, Role } from '../midnight/types';
import {
  loadCredentialsFromStorage,
  saveCredentialToStorage,
} from '../credential/credential';

interface IssuedCredentialRecord {
  credential: Credential;
  commitment: string;
  issuedAt: number;
}

interface DispensationRecord {
  medicationType: string;
  verifiedAt: number;
  nullifier: string;
}

interface NightRxState {
  role: Role;
  setRole: (role: Role) => void;

  walletConnected: boolean;
  walletAddress: string | null;
  isOnChain: boolean;
  setWalletConnected: (connected: boolean, address?: string) => void;
  setIsOnChain: (value: boolean) => void;

  contractDeployed: boolean;
  contractAddress: string | null;
  setContractDeployed: (address: string) => void;

  issuerId: string | null;
  issuerSecret: string | null;
  issuerRegistered: boolean;
  setIssuerKeys: (id: string, secret: string) => void;
  setIssuerRegistered: (registered: boolean) => void;

  issuedCredentials: IssuedCredentialRecord[];
  addIssuedCredential: (record: IssuedCredentialRecord) => void;

  credentials: Credential[];
  loadCredentials: () => void;
  addCredential: (credential: Credential) => void;

  currentProof: ProofData | null;
  setCurrentProof: (proof: ProofData | null) => void;

  dispensations: DispensationRecord[];
  addDispensation: (record: DispensationRecord) => void;

  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  runDemoSetup: () => void;
}

export const useStore = create<NightRxState>((set) => ({
  role: 'clinic',
  setRole: (role) => set({ role, error: null }),

  walletConnected: false,
  walletAddress: null,
  isOnChain: false,
  setWalletConnected: (connected, address) =>
    set({ walletConnected: connected, walletAddress: address ?? null }),
  setIsOnChain: (value) => set({ isOnChain: value }),

  contractDeployed: false,
  contractAddress: null,
  setContractDeployed: (address) =>
    set({ contractDeployed: true, contractAddress: address }),

  issuerId: null,
  issuerSecret: null,
  issuerRegistered: false,
  setIssuerKeys: (id, secret) => set({ issuerId: id, issuerSecret: secret }),
  setIssuerRegistered: (registered) => set({ issuerRegistered: registered }),

  issuedCredentials: [],
  addIssuedCredential: (record) =>
    set((state) => ({
      issuedCredentials: [...state.issuedCredentials, record],
    })),

  credentials: [],
  loadCredentials: () => set({ credentials: loadCredentialsFromStorage() }),
  addCredential: (credential) => {
    saveCredentialToStorage(credential);
    set((state) => ({ credentials: [...state.credentials, credential] }));
  },

  currentProof: null,
  setCurrentProof: (proof) => set({ currentProof: proof }),

  dispensations: [],
  addDispensation: (record) =>
    set((state) => ({
      dispensations: [...state.dispensations, record],
    })),

  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  runDemoSetup: () => {
    const issuerSecret = 'demo-issuer-secret-key-for-hackathon-2026';
    const issuerId = 'demo-issuer-' + issuerSecret.slice(0, 16);

    set({
      issuerRegistered: true,
      issuerId,
      issuerSecret,
      walletConnected: true,
      walletAddress: 'midnight1_demo_wallet_address',
      contractDeployed: true,
      contractAddress: 'demo_contract_address_0x1234',
    });
  },
}));
