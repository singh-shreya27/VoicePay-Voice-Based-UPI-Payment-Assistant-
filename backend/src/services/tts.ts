import { config } from "../config.js";
import { TTS_MAX_ATTEMPTS, TTS_SPEED, TTS_TIMEOUT_MS, type LanguageCode } from "../constants.js";
import { UpstreamError, withRetry } from "./upstream.js";

/** Text-to-speech: reply text in, base64 MP3 out. */
export async function synthesize(text: string, languageCode: LanguageCode): Promise<string> {
  if (!config.TTS_API_KEY) {
    throw new UpstreamError("TTS_API_KEY is not set");
  }
  return withRetry(() => callTts(text, languageCode, config.TTS_API_KEY), TTS_MAX_ATTEMPTS);
}

async function callTts(text: string, languageCode: LanguageCode, apiKey: string): Promise<string> {
  const res = await fetch(config.TTS_URL, {
    method: "POST",
    headers: { "X-API-Key-ID": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model: config.TTS_MODEL,
      voice: config.TTS_VOICE,
      // Our language codes match Gnani's exactly.
      language: languageCode,
      speed: TTS_SPEED,
      // MP3 keeps the base64 payload small and plays natively on Android and in browsers.
      audio_config: { container: "mp3", bitrate: "64k", sample_rate: 24000, num_channels: 1 },
    }),
    signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
  });

  // Success is raw audio bytes; errors are JSON.
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { type?: string; message?: string };
    } | null;
    const detail = body?.error ? `${body.error.type}: ${body.error.message}` : res.statusText;
    throw new UpstreamError(`TTS request failed (${res.status}) ${detail}`, res.status);
  }

  const audio = Buffer.from(await res.arrayBuffer());
  if (audio.length === 0) {
    throw new UpstreamError("TTS returned empty audio");
  }
  return audio.toString("base64");
}
