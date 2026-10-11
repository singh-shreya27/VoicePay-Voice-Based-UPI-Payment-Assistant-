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

/** 30 s of 16 kHz, 16-bit, mono PCM is 960,000 bytes, plus a 44-byte WAV header. */
export const MAX_AUDIO_BYTES = 960_044;
