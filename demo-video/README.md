# NightRx Demo Video

Remotion-based demo video with EdgeTTS narration.

## Setup

```bash
npm install
npm run generate-audio   # requires edge-tts (pip install edge-tts)
npm run studio           # preview in browser
npm run render           # render to out/nightrx-demo.mp4
```

## Required Screenshots

Capture these from the running app at `173.212.235.82` and save to `public/screenshots/`:

| File | What to capture |
|------|----------------|
| `landing-hero.png` | Landing page hero section (full viewport) |
| `landing-problem.png` | Scroll to "The Problem" section |
| `landing-howitworks.png` | "How It Works" 3-step section |
| `connect-wallet.png` | After clicking Connect — showing green "Preprod" badge |
| `clinic-register.png` | Clinic dashboard with "Register as Issuer" |
| `clinic-issue.png` | Issue Credential form with ARV selected |
| `clinic-credential.png` | After issuing — showing credential JSON |
| `patient-import.png` | Patient wallet with Import Credential dialog |
| `patient-proof.png` | After proof generation — showing proof QR |
| `pharmacy-verify.png` | Pharmacy verifier with proof pasted |
| `pharmacy-verified.png` | Big green VERIFIED result |
| `explorer-contract.png` | Midnight Explorer contract page |
| `explorer-tx.png` | Midnight Explorer transaction detail |

All screenshots should be **1920x1080**. Use browser DevTools to set viewport size.

## Rendering

```bash
npm run render
# Output: out/nightrx-demo.mp4 (~170 seconds, 1080p)
```
