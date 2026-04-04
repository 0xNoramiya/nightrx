# NightRx

> **Prove you're eligible for medication without revealing why you need it.**

Privacy-preserving healthcare credential system built on [Midnight](https://midnight.network/). Patients prove medication eligibility via zero-knowledge proofs without revealing their diagnosis.

## Links

| | |
|---|---|
| **Live App** | [nightrx.vercel.app](https://nightrx.vercel.app) |
| **Contract Address** | `05d3e2900cf0a09f73dca91225f1594928d7dbcfcfa22bbcc4990ffcddf98ea5` |
| **Network** | Midnight Preprod |
| **Explorer** | [View on Midnight Explorer](https://preprod.midnightexplorer.com/contracts/5741) |
| **Pitch Deck** | [Google Slides](https://docs.google.com/presentation/d/1qE2iZa7Uf1LMmCD9f0Ur-3gvlXqjfaGq/edit?usp=drive_link&ouid=112610668065771207633&rtpof=true&sd=true) |
| **Demo Video** | [Google Drive](https://drive.google.com/file/d/1asrELz5EzvcuFw2vRV_nm2tlZOw1qzrd/view?usp=drive_link) |

---

## The Problem

Patients needing sensitive medication (HIV treatment, mental health, addiction recovery) must currently reveal their diagnosis to pharmacists. This leads to stigma, discrimination, and people avoiding treatment entirely.

## The Solution

NightRx uses Midnight's zero-knowledge proofs to let patients prove medication eligibility without exposing any medical details:

1. **Clinic** issues a private credential after diagnosis
2. **Patient** generates a ZK proof: "I'm eligible for medication X"
3. **Pharmacy** verifies the proof on-chain — never sees the diagnosis
4. **Midnight** ensures: proof is valid, issuer is trusted, credential isn't reused

The diagnosis **never** leaves the patient's device. The pharmacist only sees: "VERIFIED — eligible for ARV."

## How It Uses Midnight

### Compact Smart Contract (`contracts/nightrx/contract.compact`)

Three circuits with real ZK proof generation:

| Circuit | What it does | Privacy |
|---------|-------------|---------|
| `registerIssuer` | Registers a clinic as trusted credential issuer | Issuer proves identity via private key (witness) |
| `issueCredential` | Stores credential commitment on-chain | Only hash goes on-chain — no medical data exposed |
| `verifyPickup` | Verifies patient eligibility + prevents double-claims | Patient's diagnosis, identity, and credential details stay private |

### Privacy Features Used

- **Zero-Knowledge Proofs** — Patient proves credential validity without revealing contents
- **Selective Disclosure** — Only the proof result (valid/invalid) is shared
- **Witness Functions** — Private data (issuer keys, patient secrets) never leave the local machine
- **Nullifier Tracking** — Prevents double-claiming without linking to patient identity
- **`persistentHash`** — Cryptographic commitments hide credential details on-chain
- **`disclose()`** — Explicit control over what becomes public (only nullifiers and issuer IDs)

### On-Chain State (Public)

```
approvedIssuers:        Map<Bytes<32>, Boolean>   — registered clinic public keys
credentialCommitments:  Set<Bytes<32>>            — hashed credential commitments
usedNullifiers:         Set<Bytes<32>>            — prevents double-dispensing
dispensationCount:      Counter                   — anonymous aggregate stats
```

### What Stays Private (Never On-Chain)

- Patient identity
- Diagnosis / medical condition
- Full credential details
- Which medication is for which condition

## Demo Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────────────┐
│  Clinic   │         │   Patient    │         │    Pharmacy      │
│ Dashboard │         │   Wallet     │         │    Verifier      │
└────┬─────┘         └──────┬───────┘         └────────┬─────────┘
     │                      │                          │
     │ 1. Register Issuer   │                          │
     │    (on-chain TX)     │                          │
     │                      │                          │
     │ 2. Issue Credential  │                          │
     │    (on-chain TX)     │                          │
     │    ──── QR code ────>│                          │
     │                      │                          │
     │                      │ 3. Generate ZK Proof     │
     │                      │    (local, private)      │
     │                      │                          │
     │                      │ ──── proof QR code ─────>│
     │                      │                          │
     │                      │         4. Verify Proof  │
     │                      │            (on-chain TX) │
     │                      │                          │
     │                      │         5. VERIFIED ✓    │
     │                      │            Dispense      │
     └──────────────────────┴──────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose

### Demo Mode (No Blockchain Required)

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app runs in demo mode with simulated transactions.

### Full On-Chain Mode (Preprod Testnet)

```bash
echo "MIDNIGHT_SEED=<your-seed>" > .env

docker run -d -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v

NIGHTRX_NETWORK=preprod MIDNIGHT_SEED=<your-seed> npm run server

npm run dev
```

## Architecture

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
│       ▼                 ▼                     ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Node.js Backend (server.ts)                │    │
│  │  Bridges frontend to Midnight SDK                    │    │
│  │  Manages wallet, signs transactions, calls circuits  │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Midnight Compact Contract                  │    │
│  │  registerIssuer() | issueCredential() | verifyPickup │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│              Midnight Preprod Testnet                         │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Compact (Midnight's ZK-enabled contract language) |
| Blockchain | Midnight Network (Preprod Testnet) |
| ZK Proofs | Halo 2 via Midnight Proof Server |
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| State | Zustand |
| Backend | Node.js + Midnight JS SDK |
| QR Codes | react-qr-code + html5-qrcode |

## Project Structure

```
nightrx/
├── contracts/
│   ├── nightrx/contract.compact              # Compact smart contract
│   └── managed/nightrx/                      # Compiled output (circuits, keys, zkir)
├── src/
│   ├── app/
│   │   ├── clinic/                           # Register issuer, issue credentials
│   │   ├── patient/                          # Store credentials, generate proofs
│   │   ├── pharmacy/                         # Verify proofs, dispense medication
│   │   └── layout/                           # TopBar, wallet connect, toasts
│   ├── midnight/
│   │   ├── server.ts                         # Backend (Midnight SDK bridge)
│   │   ├── deploy.ts                         # Contract deployment
│   │   ├── contract.ts                       # persistentHash wrappers
│   │   ├── api.ts                            # Frontend API client
│   │   ├── config.ts                         # Network config
│   │   └── types.ts                          # Shared types
│   ├── credential/                           # Credential creation, QR encode/decode
│   └── store/store.ts                        # Zustand global state
├── docker-compose.yml
├── deploy-vps.sh
└── package.json
```

## Privacy Guarantees

| What | On-chain? | Visible to pharmacy? |
|------|-----------|---------------------|
| Patient identity | Never | Never |
| Diagnosis | Never | Never |
| Medication name | Hash only | Type only (e.g., "ARV") |
| Credential details | Hash only | Never |
| Issuer identity | Public key hash | Verified as "registered" |
| Nullifier | Hash on-chain | Not linkable to patient |

## License

MIT
