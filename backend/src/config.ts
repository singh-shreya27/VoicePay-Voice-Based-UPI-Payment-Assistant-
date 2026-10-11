import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  STT_URL: z.string().url(),
  STT_API_KEY: z.string().default(""),
  LLM_API_KEY: z.string().default(""),
  TTS_API_KEY: z.string().default(""),
});

export const config = schema.parse(process.env);
