import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./constants.js";

export const payRequestSchema = z.object({
  audio: z.string().min(1), // base64-encoded recording
  language_code: z.enum(SUPPORTED_LANGUAGES),
});

export type PayRequest = z.infer<typeof payRequestSchema>;

// `contact_not_found` is emitted by the app after its own name -> UPI-ID lookup; the backend
// never returns it, since contacts live on the device.
export type PayStatus = "confirm" | "need_info" | "contact_not_found" | "not_understood";

// Name -> UPI-ID resolution and upi:// link building happen on the app, so the backend returns
// only what it parsed from speech.
export interface ParsedPayment {
  payee_name: string;
  amount: number;
}

export interface PayResponse {
  status: PayStatus;
  speech: string;
  tts_audio: string; // base64 audio of `speech`
  payment?: ParsedPayment; // only when status = "confirm"
}
