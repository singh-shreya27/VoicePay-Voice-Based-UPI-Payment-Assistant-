# backend

Express + TypeScript service orchestrating STT → LLM → TTS.

## Run
```bash
npm install
cp .env.example .env   # fill in API keys
npm run dev            # http://localhost:3000
```

## Endpoints
- `GET /health` — liveness check
- `POST /pay` — body `{audio, language_code}`, where `audio` is base64 **WAV (PCM 16-bit, 16 kHz, mono, ≤ 30 s)**. Returns `{status, speech, tts_audio, payment?}`. See the root README for the full contract.

## Layout
```
src/
├── index.ts         # entry
├── app.ts           # express app
├── config.ts        # env validation
├── types.ts         # /pay contract types
├── routes/pay.ts    # POST /pay
└── services/        # stt, llm, tts, upi
```
