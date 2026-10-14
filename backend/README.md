# backend

Express + TypeScript service orchestrating STT → LLM → TTS.

## Run

```bash
npm install
cp .env.example .env   # fill in API keys
npm run dev            # http://localhost:3000
```

## Scripts

```bash
npm run dev            # start the dev server with auto-reload
npm run typecheck      # TypeScript check, no output files
npm run format         # format all files with Prettier
npm run format:check   # check formatting without changing files
```

Code style is enforced by [Prettier](https://prettier.io) (config in `.prettierrc.json`). Run `npm run format` before committing.

## Endpoints

- `GET /health` — liveness check
- `POST /pay` — body `{audio, language_code}`, where `audio` is base64 **WAV (PCM 16-bit, 16 kHz, mono, ≤ 30 s)**. Returns `{status, speech, tts_audio, payment?}`, where `payment` (on `confirm`) is `{payee_name, amount}` only — the app resolves the contact and builds the UPI link. See the root README for the full contract.

## Layout

```
src/
├── index.ts         # entry
├── app.ts           # express app
├── config.ts        # env validation
├── constants.ts     # supported languages, limits
├── types.ts         # /pay contract types
├── routes/pay.ts    # POST /pay
└── services/        # stt, llm, tts
```
