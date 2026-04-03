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
  // Role
  role: Role;
  setRole: (role: Role) => void;

  // Wallet
  walletConnected: boolean;
  walletAddress: string | null;
  isOnChain: boolean;
  setWalletConnected: (connected: boolean, address?: string) => void;
  setIsOnChain: (value: boolean) => void;

  // Contract
  contractDeployed: boolean;
  contractAddress: string | null;
  setContractDeployed: (address: string) => void;

  // Issuer
  issuerId: string | null;
  issuerSecret: string | null;
  issuerRegistered: boolean;
  setIssuerKeys: (id: string, secret: string) => void;
  setIssuerRegistered: (registered: boolean) => void;

  // Clinic — issued credentials history
  issuedCredentials: IssuedCredentialRecord[];
  addIssuedCredential: (record: IssuedCredentialRecord) => void;

  // Patient — stored credentials
  credentials: Credential[];
  loadCredentials: () => void;
  addCredential: (credential: Credential) => void;

  // Patient — generated proofs
  currentProof: ProofData | null;
  setCurrentProof: (proof: ProofData | null) => void;

  // Pharmacy — dispensation history
  dispensations: DispensationRecord[];
  addDispensation: (record: DispensationRecord) => void;

  // UI state
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Demo helpers
  runDemoSetup: () => void;
}

export const useStore = create<NightRxState>((set) => ({
  // Role
  role: 'clinic',
  setRole: (role) => set({ role, error: null }),

  // Wallet
  walletConnected: false,
  walletAddress: null,
  isOnChain: false,
  setWalletConnected: (connected, address) =>
    set({ walletConnected: connected, walletAddress: address ?? null }),
  setIsOnChain: (value) => set({ isOnChain: value }),

  // Contract
  contractDeployed: false,
  contractAddress: null,
  setContractDeployed: (address) =>
    set({ contractDeployed: true, contractAddress: address }),

  // Issuer
  issuerId: null,
  issuerSecret: null,
  issuerRegistered: false,
  setIssuerKeys: (id, secret) => set({ issuerId: id, issuerSecret: secret }),
  setIssuerRegistered: (registered) => set({ issuerRegistered: registered }),

  // Clinic
  issuedCredentials: [],
  addIssuedCredential: (record) =>
    set((state) => ({
      issuedCredentials: [...state.issuedCredentials, record],
    })),

  // Patient
  credentials: [],
  loadCredentials: () => set({ credentials: loadCredentialsFromStorage() }),
  addCredential: (credential) => {
    saveCredentialToStorage(credential);
    set((state) => ({ credentials: [...state.credentials, credential] }));
  },

  // Proof
  currentProof: null,
  setCurrentProof: (proof) => set({ currentProof: proof }),

  // Pharmacy
  dispensations: [],
  addDispensation: (record) =>
    set((state) => ({
      dispensations: [...state.dispensations, record],
    })),

  // UI
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Demo helpers — pre-populate for presentation
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
