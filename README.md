# NightRx

Privacy-preserving healthcare credential system built on [Midnight](https://midnight.network/).

Patients prove medication eligibility via zero-knowledge proofs without revealing their diagnosis.

## Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- [Lace wallet](https://www.lace.io/) browser extension (for Midnight)

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 — click **Demo Mode** to pre-populate state.

### With Local Midnight Network

```bash
# Start Midnight services (node, indexer, proof server)
npm run docker:up

# Compile the Compact contract
npm run compile

# Deploy to local network
npm run deploy

# Start the app
npm run dev
```

### With Preprod Testnet

```bash
npm run start-proof-server   # Run proof server locally
npm run compile               # Compile contract
npm run deploy -- preprod     # Deploy to Preprod
npm run dev                   # Start app
```

## Demo Flow

1. **Clinic** — Register as issuer — Issue credential — QR code generated
2. **Patient** — Import credential (paste JSON) — Generate ZK proof — QR code
3. **Pharmacy** — Paste proof — Verify on Midnight — VERIFIED — Dispense

## Architecture

```
Clinic Dashboard ──> issueCredential() ──> Midnight Contract
                                              │
Patient Wallet ──> ZK Proof (local) ─────────>│
                                              │
Pharmacy Verifier ──> verifyPickup() ────────>│
                                              ▼
                                      On-chain state:
                                      - Issuer registry
                                      - Credential commitments
                                      - Nullifier tracking
                                      - Dispensation counter
```

- **Compact Contract:** Issuer registry, credential commitments, nullifier tracking
- **ZK Proofs:** Patient proves eligibility without revealing diagnosis
- **Selective Disclosure:** Only proof validity is shared, never medical data

## Tech Stack

- Midnight Blockchain (Compact smart contracts)
- React + Vite + Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Zero-knowledge proofs via Midnight Proof Server

## Privacy Guarantees

- Diagnosis NEVER goes on-chain
- Patient identity is NOT revealed
- Pharmacy sees only: "eligible for medication X" — nothing more
- Nullifiers prevent double-claims without linking identity

## Project Structure

```
nightrx/
├── contracts/nightrx/contract.compact   # Compact smart contract
├── src/
│   ├── app/
│   │   ├── clinic/                      # Clinic dashboard (issue credentials)
│   │   ├── patient/                     # Patient wallet (store & prove)
│   │   ├── pharmacy/                    # Pharmacy verifier (verify & dispense)
│   │   └── layout/                      # TopBar, role switcher
│   ├── midnight/                        # Blockchain integration layer
│   ├── credential/                      # Credential & QR utilities
│   └── store/                           # Zustand state management
├── docker-compose.yml                   # Local Midnight dev services
└── package.json
```

## License

MIT
