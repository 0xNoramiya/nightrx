# NightRx - Privacy-Preserving Healthcare Credential System

**Date:** 2026-04-04
**Hackathon:** Midnight Blockchain - Healthcare Track
**Team:** Solo developer, 1 week
**Priority:** Polished UI/UX + real ZK proofs on Midnight

---

## Overview

NightRx allows patients to prove eligibility for sensitive medication (HIV treatment, PrEP, STI medication, mental health) without revealing their diagnosis. A clinic issues a private credential on Midnight, the patient generates a zero-knowledge proof, and a pharmacy verifies it on-chain. The diagnosis never leaves the patient's device.

**One-liner:** "Prove you're eligible for medication without revealing why you need it."

---

## Architecture

### Approach: Hybrid (On-chain verification core, off-chain credential storage)

```
┌─────────────────────────────────────────────────────────────┐
│                      NightRx System                         │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Clinic   │    │   Patient    │    │    Pharmacy      │   │
│  │ Dashboard │    │   Wallet     │    │    Verifier      │   │
│  │ (React)   │    │  (React)     │    │    (React)       │   │
│  └────┬─────┘    └──────┬───────┘    └────────┬─────────┘   │
│       │                 │                     │              │
│       │ Issue           │ Generate            │ Submit       │
│       │ credential      │ ZK proof            │ proof        │
│       │ (on-chain tx)   │ (local)             │              │
│       ▼                 ▼                     ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              TypeScript Service Layer                │    │
│  │  - Credential creation & serialization              │    │
│  │  - Local proof generation (via Proof Server)        │    │
│  │  - Wallet state management (localStorage)           │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Midnight Compact Contract                  │    │
│  │  - Issuer registry (Map<Bytes<32>, Boolean>)        │    │
│  │  - Credential commitments (Set<Bytes<32>>)          │    │
│  │  - Nullifier tracking (Set<Bytes<32>>)              │    │
│  │  - Dispensation counter (Counter)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│               Midnight Network (Preprod / Local)             │
└─────────────────────────────────────────────────────────────┘
```

**Key decisions:**
- Single React app with 3 role-based views (Clinic/Patient/Pharmacy) via role switcher
- No backend server — everything is client-side + Midnight
- Credential issuance is an on-chain transaction (issuer proves identity via witness, commitment stored on-chain)
- ZK proof generation happens locally via Midnight's Proof Server (Docker)
- Credentials stored in browser localStorage

---

## Data Model

### Credential (private, stored in patient's browser)

```typescript
interface Credential {
  issuerId: string;        // issuer's public key hash (Bytes<32>)
  patientSecret: string;   // random Bytes<32>, known only to patient
  medicationType: string;  // "ARV", "PrEP", "STI-Treatment", etc.
  medicationHash: string;  // hash of medicationType (Bytes<32>)
  validFrom: number;       // unix timestamp
  expiryDate: number;      // unix timestamp
}
```

### On-chain ledger state (public)

```
approvedIssuers: Map<Bytes<32>, Boolean>      // registered issuer public keys
credentialCommitments: Set<Bytes<32>>         // hash commitments of issued credentials
usedNullifiers: Set<Bytes<32>>               // prevent double-claims
dispensationCount: Counter                   // anonymous aggregate stats
```

### Nullifier derivation

```
nullifier = persistentHash(patientSecret, medicationHash)
```

- Deterministic: same patient + same medication always produces the same nullifier
- Unlinkable: different medications produce different nullifiers
- No identity leakage: cannot reverse hash to find patient

### Credential commitment

```
commitment = persistentHash(patientSecret, medicationHash, validFrom, expiry)
```

- Hides all credential details
- Only the hash goes on-chain
- Patient proves knowledge of the preimage during verification

---

## Compact Smart Contract

```compact
pragma language_version >= 0.22;

export ledger approvedIssuers: Map<Bytes<32>, Boolean>;
export ledger credentialCommitments: Set<Bytes<32>>;
export ledger usedNullifiers: Set<Bytes<32>>;
export ledger dispensationCount: Counter;

witness issuerSecret(): Bytes<32>;
witness credentialData(): [Bytes<32>, Bytes<32>, Uint<64>, Uint<64>];

export circuit registerIssuer(issuerId: Bytes<32>): [] {
  approvedIssuers.insert(disclose(issuerId), true);
}

export circuit issueCredential(
  issuerId: Bytes<32>,
  commitment: Bytes<32>
): [] {
  assert(approvedIssuers.lookup(disclose(issuerId)) == some<Boolean>(true),
         "Not a registered issuer");
  const sk = issuerSecret();
  const computedId = persistentHash<Vector<2, Bytes<32>>>([pad(32, "nightrx:issuer:"), sk]);
  assert(computedId == issuerId, "Invalid issuer key");
  credentialCommitments.insert(disclose(commitment));
}

export circuit verifyPickup(
  nullifier: Bytes<32>,
  currentTimestamp: Uint<64>,
  medicationTypeHash: Bytes<32>
): [] {
  const [patientSecret, medHash, validFrom, expiry] = credentialData();
  assert(medHash == medicationTypeHash, "Medication mismatch");
  assert(currentTimestamp >= validFrom, "Not yet valid");
  assert(currentTimestamp <= expiry, "Expired");
  const commitment = persistentHash<Vector<4, Bytes<32>>>(
    [patientSecret, medHash, pad(32, validFrom), pad(32, expiry)]
  );
  assert(credentialCommitments.contains(commitment), "Credential not found");
  const expectedNullifier = persistentHash<Vector<2, Bytes<32>>>(
    [patientSecret, medHash]
  );
  assert(disclose(nullifier) == expectedNullifier, "Invalid nullifier");
  assert(!usedNullifiers.contains(disclose(nullifier)), "Already dispensed");
  usedNullifiers.insert(disclose(nullifier));
  dispensationCount += 1;
}
```

**Design notes:**
- Issuer proves identity by deriving public key from private key inside the circuit (witness provides private key, circuit hashes it and compares to registered ID)
- Credential commitment stored on-chain — the on-chain transaction IS the issuer's signature
- Patient proves knowledge of credential preimage during verification
- `disclose()` used only for nullifier and issuer ID (minimum public exposure)
- `persistentHash` is Midnight's built-in ZK-friendly hash function

---

## Frontend Design

### Tech Stack
- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- react-qr-code + html5-qrcode (QR generation/scanning)
- zustand (state management)
- @midnight-ntwrk/* SDK packages

### Layout
- Top bar: NightRx logo + role switcher (Clinic / Patient / Pharmacy)
- Dark theme, medical-grade aesthetic (deep blues, greens, clean typography)
- Animated transitions between views

### View 1: Clinic Dashboard
- "Register as Issuer" button (one-time setup, calls `registerIssuer()`)
- Issue credential form: medication type dropdown, date pickers, auto-generated patient secret
- Calls `issueCredential()` on Midnight
- Generates downloadable QR/JSON credential for patient
- Shows history of issued credentials

### View 2: Patient Wallet
- Import credential via QR scan or JSON paste
- Credential cards showing status, medication, expiry
- "Generate Proof" button — animated progress while proof server works
- Outputs QR code / JSON proof blob for pharmacy
- Proof history log

### View 3: Pharmacy Verifier
- QR scan or paste proof JSON input
- Calls `verifyPickup()` on Midnight
- Big animated VERIFIED / REJECTED result display
- Shows: medication type, issuer status, expiry status, nullifier status
- "Dispense Medication" confirmation button
- Dispensation history log

### Demo Flow (single browser tab)
1. Clinic → register issuer → issue credential
2. Patient → import credential → generate proof
3. Pharmacy → scan proof → verify → dispense

---

## Project Structure

```
nightrx/
├── contracts/
│   └── nightrx/
│       └── contract.compact
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   └── RoleSwitcher.tsx
│   │   ├── clinic/
│   │   │   ├── ClinicDashboard.tsx
│   │   │   ├── IssueCredentialForm.tsx
│   │   │   └── IssuedCredentialsList.tsx
│   │   ├── patient/
│   │   │   ├── PatientWallet.tsx
│   │   │   ├── CredentialCard.tsx
│   │   │   ├── ImportCredential.tsx
│   │   │   └── ProofGenerator.tsx
│   │   └── pharmacy/
│   │       ├── PharmacyVerifier.tsx
│   │       ├── VerificationResult.tsx
│   │       └── DispensationLog.tsx
│   ├── midnight/
│   │   ├── contract.ts
│   │   ├── wallet.ts
│   │   ├── providers.ts
│   │   └── types.ts
│   ├── credential/
│   │   ├── credential.ts
│   │   ├── nullifier.ts
│   │   └── qr.ts
│   └── store/
│       └── store.ts
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── midnight.config.js
```

### Development Setup
- Local Midnight node via `midnight-local-dev` Docker (node + indexer + proof server)
- Lace wallet browser extension
- Scaffold base with `npx create-mn-app`, restructure to project layout

---

## Demo Script

### Elevator Pitch (30s)
"NightRx lets patients prove they're eligible for sensitive medication — like HIV treatment — without revealing their diagnosis to anyone. A clinic issues a private credential, the patient generates a zero-knowledge proof, and the pharmacy verifies it on Midnight's blockchain. The diagnosis never leaves the patient's device. No stigma. No data leaks. Just access to care."

### Presentation Flow (3-4 minutes)

1. **The Problem (30s):** HIV patients must reveal diagnosis to get medication. Leads to stigma, discrimination, treatment avoidance.
2. **Clinic Issues Credential (45s):** Demo issuing credential on Midnight. Commitment on-chain, details private.
3. **Patient Generates Proof (60s):** Import credential, generate ZK proof locally. Emphasize: proof says "eligible" not "HIV-positive."
4. **Pharmacy Verifies (45s):** Scan QR, verify on-chain. Big VERIFIED animation. Pharmacist never sees diagnosis.
5. **Why Midnight (30s):** ZK proofs for privacy, on-chain verification for trust, selective disclosure for patient control. All native in Compact.

### Judge Q&A Preparation

| Question | Answer |
|----------|--------|
| How is this different from encryption? | Encryption requires decryption. ZK proofs verify without exposing data. Pharmacist can't see diagnosis even if they wanted to. |
| What stops credential sharing? | Nullifier derives from patient secret. Sharing credential = sharing secret = losing refill access. Self-protecting. |
| How does revocation work? | Clinic removes commitment from on-chain set. Next verification fails. |
| Scalability? | Halo 2 proofs, sub-second verification, 1000+ TPS. One hash per credential. Scales nationally. |
| Only for HIV? | Any sensitive medication: mental health, addiction, reproductive health. Proves eligibility without revealing reason. |

---

## Scope Boundaries

### In scope (must have)
- Compact contract with issuer registry, credential commitments, nullifier tracking
- 3-view React app with role switcher
- Real ZK proof generation and on-chain verification
- QR-based credential and proof transfer
- Polished UI with animations
- Working end-to-end demo flow

### Out of scope (mention in pitch as "future work")
- Multi-refill tracking (multiple nullifiers per credential)
- Credential revocation circuit
- Emergency disclosure mode
- Anonymous public health aggregation
- Mobile app
- Real hospital/pharmacy integration
- Production key management
