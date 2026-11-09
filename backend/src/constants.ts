/** Languages the STT provider accepts. The user picks one in the app. */
export const SUPPORTED_LANGUAGES = [
  "bn-IN",
  "en-IN",
  "gu-IN",
  "hi-IN",
  "kn-IN",
  "ml-IN",
  "mr-IN",
  "pa-IN",
  "ta-IN",
  "te-IN",
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const STT_TIMEOUT_MS = 20_000;
export const STT_MAX_ATTEMPTS = 3;

// TTS is the last step before the user hears anything, so keep it short; on failure /pay still
// answers, just without audio.
export const TTS_TIMEOUT_MS = 15_000;
export const TTS_MAX_ATTEMPTS = 2;
/** Slightly slower than normal (1.0) for elderly listeners. Gnani allows 0.85–1.15. */
export const TTS_SPEED = 0.9;

// A generous timeout and a few retries cover a slow or rate-limited call. 256 tokens is
// ample for the one-line JSON we ask for.
export const LLM_TIMEOUT_MS = 30_000;
export const LLM_MAX_ATTEMPTS = 3;
export const LLM_MAX_TOKENS = 256;

/** Amount sanity bounds, in whole rupees. Anything outside is treated as a bad parse. */
export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 500_000;

/** 30 s of 16 kHz, 16-bit, mono PCM is 960,000 bytes, plus a 44-byte WAV header. */
export const MAX_AUDIO_BYTES = 960_044;
