import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  STT_URL: z.string().url().default("https://api.vachana.ai/stt/v3"),
  STT_API_KEY: z.string().default(""),
  // Gemini via its OpenAI-compatible chat-completions endpoint.
  LLM_URL: z
    .string()
    .url()
    .default("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"),
  LLM_MODEL: z.string().default("gemini-3.5-flash-lite"),
  LLM_API_KEY: z.string().default(""),
  // Gnani/Vachana TTS. timbre-v3.0 voices speak all supported languages, so one voice is enough.
  TTS_URL: z.string().url().default("https://api.vachana.ai/api/v1/tts/inference"),
  TTS_MODEL: z.string().default("timbre-v3.0"),
  TTS_VOICE: z.string().default("Shivani"),
  TTS_API_KEY: z.string().default(""),
});

export const config = schema.parse(process.env);
