import { Router } from "express";
import { MAX_AUDIO_BYTES } from "../constants.js";
import { extractPayment } from "../services/llm.js";
import { transcribe } from "../services/stt.js";
import { payRequestSchema, type PayResponse } from "../types.js";

export const payRouter = Router();

/** A WAV file starts with "RIFF", a 4-byte size, then "WAVE". */
function isWav(audio: Buffer): boolean {
  return (
    audio.length >= 12 &&
    audio.toString("ascii", 0, 4) === "RIFF" &&
    audio.toString("ascii", 8, 12) === "WAVE"
  );
}

payRouter.post("/", async (req, res) => {
  const parsed = payRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }

  const audio = Buffer.from(parsed.data.audio, "base64");
  if (audio.length === 0) {
    res.status(400).json({ error: "audio is not valid base64" });
    return;
  }

  if (!isWav(audio)) {
    res.status(400).json({ error: "audio must be a WAV file (PCM 16-bit, 16 kHz, mono)" });
    return;
  }
  if (audio.length > MAX_AUDIO_BYTES) {
    res.status(400).json({ error: "audio is too long; maximum is 30 seconds" });
    return;
  }

  try {
    const transcript = await transcribe(audio, parsed.data.language_code);
    console.log("TEMP stt transcript:", transcript); // TEMP
    if (!transcript) {
      res.json({
        status: "not_understood",
        speech: "I could not hear anything. Please try again.",
        tts_audio: "",
      } satisfies PayResponse);
      return;
    }

    const { payee, amount } = await extractPayment(transcript);
    res.json(buildResponse(payee, amount));
  } catch (err) {
    console.error("pay failed:", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "Could not process the request" });
  }
});

/** Map the parsed {payee, amount} onto the envelope the app switches on. */
function buildResponse(payee: string | null, amount: number | null): PayResponse {
  if (payee && amount !== null) {
    return {
      status: "confirm",
      speech: `Pay ₹${amount} to ${payee}. Say yes to confirm.`,
      tts_audio: "",
      payment: { payee_name: payee, amount },
    };
  }
  if (payee) {
    return {
      status: "need_info",
      speech: `How much do you want to send to ${payee}?`,
      tts_audio: "",
    };
  }
  if (amount !== null) {
    return {
      status: "need_info",
      speech: `Who do you want to pay ₹${amount} to?`,
      tts_audio: "",
    };
  }
  return {
    status: "not_understood",
    speech: "Sorry, I could not understand that.",
    tts_audio: "",
  };
}
