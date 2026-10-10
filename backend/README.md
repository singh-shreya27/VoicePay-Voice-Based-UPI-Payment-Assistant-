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
- `POST /pay` — audio in, `{status, speech, tts_audio, payment?}` out (currently a stub; see root README for the contract)

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
