# Voice-Assisted UPI Payment

A prototype Android app that lets users make UPI payments by voice — aimed at elderly users who find it hard to open a payment app, find the right contact, and enter an amount. The user speaks ("Pay 500 rupees to Ramesh"), the app understands it, reads the payment back for confirmation, and hands off to their UPI app (GPay / PhonePe / etc.) where they enter their PIN as usual.

> **Prototype scope.** This is a demo build, not a production payment app. It uses UPI deep-link intents and does not move money itself. Security hardening, certification, and robustness items are tracked in the post-demo backlog.

---

## How it works

```
 APP                          BACKEND                         PROVIDERS
  |  audio ───────────────────►  |                               |
  |                              |── audio ──► STT ──► text ──────|
  |                              |── text ───► LLM ──► {payee,amt}─|
  |                              |── reply ──► TTS ──► audio ──────|
  |  ◄──── {status, speech, ──── |                               |
  |         tts_audio, payment}  |                               |
  |  confirm screen → fire UPI intent → UPI app → user enters PIN |
```

**Pipeline:** audio → **STT** (speech-to-text) → **LLM** extracts `{payee, amount}` → reply text → **TTS** (text-to-speech) → audio played to the user.

**Key principle:** the app only ever talks to the backend. STT, the LLM, and TTS are all called *from the backend* — never directly from the app — so API keys stay server-side.

---

## Architecture decisions

- **Native Android** (Kotlin + Jetpack Compose).
- **One backend** holding STT, the LLM, TTS, and payment-helper functions. No microservices.
- **No MCP.** There is one action (pay). Contact resolution and UPI-link building are plain backend/app functions, not MCP tools. (MCP is parked for if the action set ever grows.)
- **Add contact is a manual typed screen,** not a voice action — dictating a UPI ID by voice is unreliable.
- **Confirmation is mandatory** before firing a payment: the app reads back "Pay ₹X to Y" and requires a Confirm tap.
- **Contacts (name → UPI ID) are stored locally on the device** (Room database), seeded with demo contacts. They are not held on the server.
- **Payment is via UPI deep-link intent** (`upi://pay?pa=&pn=&am=&cu=INR`) launched with `startActivityForResult`. The user completes the PIN in their own UPI app. Result status comes back via the activity result (not fully reliable — acceptable for the prototype).

---

## Repository structure

```
.
├── android-app/     # Native Android app (Kotlin, Jetpack Compose)
├── backend/         # Backend: STT + LLM + TTS orchestration, /pay endpoint
├── .gitignore
└── README.md
```

---

## Getting started

### Prerequisites
- **Android:** Android Studio (latest stable), a physical Android phone with USB debugging enabled (min SDK 24 / Android 7.0).
- **Backend:** the chosen runtime (Node 20+ **or** Python 3.11+ — see `backend/`).
- API keys for the STT, LLM, and TTS providers.

### Android app
```bash
cd android-app
# Open this folder in Android Studio, let Gradle sync, then Run on your device.
```

### Backend
```bash
cd backend
# Install dependencies and copy the example env file:
cp .env.example .env     # then fill in your API keys
# Run the dev server (see backend/README for the exact command).
```

> **Local dev:** phone on USB with the backend on your laptop over the same Wi-Fi (cleartext config), or use ngrok to expose the backend. Deploy to Railway/Render before the demo.

### Environment variables (backend `.env`)
```
PORT=3000
STT_URL=https://api.vachana.ai/stt/v3
STT_API_KEY=
LLM_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
LLM_MODEL=gemini-3.5-flash-lite
LLM_API_KEY=
TTS_URL=https://api.vachana.ai/api/v1/tts/inference
TTS_MODEL=timbre-v3.0
TTS_VOICE=Shivani
TTS_API_KEY=
```
**Never commit `.env`.** It is git-ignored.

---

## The `/pay` API contract

### Request: `POST /pay`

```jsonc
{
  "audio": "<base64 WAV>",
  "language_code": "hi-IN"
}
```

- **`language_code`** is chosen by the user on first launch (stored on the device, changeable in settings) and sent with every request. The STT provider requires it and does not auto-detect. Allowed: `bn-IN`, `en-IN`, `gu-IN`, `hi-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `ta-IN`, `te-IN`.
- **`audio` format (the backend accepts only this):** **WAV, PCM 16-bit little-endian, 16 kHz, mono**, base64-encoded, **max 30 seconds**. On Android, record with `AudioRecord` at 16 kHz mono and prepend a 44-byte WAV header; stop recording at 30 s. Anything that isn't a WAV, or is longer than 30 s, gets a `400`.

### Response

The backend replies with one envelope the app switches on:

```jsonc
{
  "status": "confirm | need_info | contact_not_found | not_understood",
  "speech": "reply text, in the request's language",
  "tts_audio": "<base64 MP3 of `speech`, or \"\" if TTS failed>",
  "payment": {               // present only when status = confirm
    "payee_name": "Ramesh",  // parsed from speech, romanized
    "amount": 500            // whole rupees
  }
}
```

| status              | meaning                                  | app shows                         |
|---------------------|------------------------------------------|-----------------------------------|
| `confirm`           | name + amount parsed from speech         | resolve contact → confirmation    |
| `need_info`         | payment understood, a field is missing   | listening again (asks for it)     |
| `contact_not_found` | name not in contacts (**app-emitted**)   | prompt to add the contact         |
| `not_understood`    | STT/LLM couldn't parse the request       | error state, retry                |

- **`speech` / `tts_audio`:** the reply is in the user's `language_code`. `tts_audio` is base64 **MP3 (mono, 24 kHz)**; play it, and show `speech` as text. If TTS fails the backend still answers with `tts_audio: ""` — just show `speech`.
- **`contact_not_found` has no backend audio** (the app emits it), so the app needs its own prompt for it — a bundled clip per language, or Android `TextToSpeech`.

> **Settled:** name → UPI-ID resolution runs **on the app** (contacts stay on the device). The backend returns only the parsed `{payee_name, amount}`; the app resolves the contact, builds the `upi://` link, and is the only side that emits `contact_not_found`.

---

## Scope

**In the demo (~71 pts, 20 days, 2 devs):** repo setup, design screens, voice capture + playback, STT + LLM parsing, contact store + manual add-contact, confirmation, UPI intent + result handling, deploy, rehearsed backup recording.

**Post-demo backlog:** per-device auth tokens, rate limiting, provider spend caps, full error/edge states, UX polish pass, signed release APK, logging, HTTPS hardening — plus platform items (Play Integrity, NPCI/TPAP certification for true P2P, PSP SDK fallback, UPI Circle).

---

## Team

- **Dev A — Android** (`android-app/`)
- **Dev B — Backend** (`backend/`)

Tickets are tracked on the GitHub Project board.
