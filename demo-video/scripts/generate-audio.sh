#!/usr/bin/env bash
set -euo pipefail

VOICE="en-US-AndrewMultilingualNeural"
RATE="-5%"
OUT="public/audio"

cd "$(dirname "$0")/.."
mkdir -p "$OUT"

echo "Generating scene audio with EdgeTTS..."

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "Millions of patients avoid picking up sensitive medications — HIV treatment, mental health drugs, addiction recovery — because they're forced to reveal their diagnosis at the pharmacy. NightRx fixes this." \
  --write-media "$OUT/scene1.mp3" --write-subtitles "$OUT/scene1.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "NightRx is a privacy-preserving healthcare credential system built on Midnight. A clinic issues a private credential. The patient generates a zero-knowledge proof. And the pharmacy verifies it on-chain — without ever seeing the diagnosis." \
  --write-media "$OUT/scene2.mp3" --write-subtitles "$OUT/scene2.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "Let's see it in action. We connect to the Midnight preprod testnet. This is a live, on-chain demo." \
  --write-media "$OUT/scene3.mp3" --write-subtitles "$OUT/scene3.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "First, the clinic registers as a trusted issuer. This generates a real zero-knowledge proof on Midnight. The clinic proves it holds a valid private key, without ever exposing it." \
  --write-media "$OUT/scene4a.mp3" --write-subtitles "$OUT/scene4a.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "Now the clinic issues a credential for a patient. We select a medication type — let's say ARV for HIV treatment. A credential commitment is stored on-chain, but the medical details remain completely private." \
  --write-media "$OUT/scene4b.mp3" --write-subtitles "$OUT/scene4b.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "The patient imports their credential and generates a zero-knowledge proof. This proof says: I am eligible for this medication — nothing more. The diagnosis, the clinic's identity, and the patient's personal details all stay private." \
  --write-media "$OUT/scene5.mp3" --write-subtitles "$OUT/scene5.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "The pharmacist scans or pastes the proof. Midnight's smart contract checks three things: the credential commitment exists, the issuer is trusted, and this prescription hasn't been used before. All verified with zero-knowledge — the pharmacist sees only one word." \
  --write-media "$OUT/scene6a.mp3" --write-subtitles "$OUT/scene6a.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "Verified. The patient gets their medication. No stigma. No discrimination. No data leaked." \
  --write-media "$OUT/scene6b.mp3" --write-subtitles "$OUT/scene6b.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "Every transaction is real and verifiable on the Midnight preprod explorer. You can see the contract interactions — but thanks to zero-knowledge proofs, the medical data is never exposed on-chain." \
  --write-media "$OUT/scene7.mp3" --write-subtitles "$OUT/scene7.vtt"

edge-tts --voice "$VOICE" --rate="$RATE" \
  --text "NightRx is built with Midnight's Compact smart contracts, real Halo 2 zero-knowledge proofs, and a React frontend. Every proof is generated locally. Every verification happens on-chain. And the patient's privacy is never compromised. NightRx — prove eligibility, not your diagnosis." \
  --write-media "$OUT/scene8.mp3" --write-subtitles "$OUT/scene8.vtt"

echo "Done! Audio files in $OUT/"
ls -la "$OUT/"
