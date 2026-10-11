import { Router } from "express";
import { MAX_AUDIO_BYTES } from "../constants.js";
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
    console.log("TEMP stt transcript:", transcript); // TEMP: remove after STT testing
    const body: PayResponse = {
      status: "not_understood",
      speech: transcript
        ? "Sorry, I could not understand that."
        : "I could not hear anything. Please try again.",
      tts_audio: "",
    };
    res.json(body);
  } catch (err) {
    console.error("pay failed:", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "Speech recognition failed" });
  }
});
