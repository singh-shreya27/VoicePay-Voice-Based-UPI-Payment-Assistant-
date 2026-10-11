import { config } from "../config.js";
import { STT_MAX_ATTEMPTS, STT_TIMEOUT_MS, type LanguageCode } from "../constants.js";

export class SttError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SttError";
  }
}

/** Speech-to-text: audio bytes in, transcript out. */
export async function transcribe(audio: Buffer, languageCode: LanguageCode): Promise<string> {
  if (!config.STT_API_KEY) {
    throw new SttError("STT_API_KEY is not set");
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= STT_MAX_ATTEMPTS; attempt++) {
    try {
      return await callStt(audio, languageCode, config.STT_API_KEY);
    } catch (err) {
      lastError = err;
      // Only transient failures are worth retrying; 4xx means our request is wrong.
      const retryable = !(err instanceof SttError) || err.status === undefined || err.status >= 500;
      if (!retryable || attempt === STT_MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

async function callStt(audio: Buffer, languageCode: LanguageCode, apiKey: string): Promise<string> {
  const form = new FormData();
  // The app always sends WAV (16 kHz, 16-bit, mono PCM); /pay rejects anything else.
  form.append("audio_file", new Blob([new Uint8Array(audio)], { type: "audio/wav" }), "audio.wav");
  form.append("language_code", languageCode);
  // "transcribe" applies inverse text normalization, so "five hundred" -> "500".
  form.append("format", "transcribe");

  const res = await fetch(config.STT_URL, {
    method: "POST",
    headers: { "X-API-Key-ID": apiKey },
    body: form,
    signal: AbortSignal.timeout(STT_TIMEOUT_MS),
  });

  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    transcript?: string;
    error?: { type?: string; message?: string };
  } | null;

  if (!res.ok || !body?.success) {
    const detail = body?.error ? `${body.error.type}: ${body.error.message}` : res.statusText;
    throw new SttError(`STT request failed (${res.status}) ${detail}`, res.status);
  }

  return (body.transcript ?? "").trim();
}
