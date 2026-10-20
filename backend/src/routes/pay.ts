import { Router } from "express";
import { MAX_AUDIO_BYTES, type LanguageCode } from "../constants.js";
import { replies } from "../replies.js";
import { extractPayment } from "../services/llm.js";
import { transcribe } from "../services/stt.js";
import { synthesize } from "../services/tts.js";
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

  // Invalid base64 decodes to garbage or nothing, which the WAV check rejects.
  const audio = Buffer.from(parsed.data.audio, "base64");
  if (!isWav(audio)) {
    res.status(400).json({ error: "audio must be a WAV file (PCM 16-bit, 16 kHz, mono)" });
    return;
  }
  if (audio.length > MAX_AUDIO_BYTES) {
    res.status(400).json({ error: "audio is too long; maximum is 30 seconds" });
    return;
  }

  const lang = parsed.data.language_code;
  try {
    const transcript = await transcribe(audio, lang);
    if (!transcript) {
      res.json(
        await withSpeech(
          { status: "not_understood", speech: replies[lang].notHeard, tts_audio: "" },
          lang,
        ),
      );
      return;
    }

    const { payee, amount } = await extractPayment(transcript);
    res.json(await withSpeech(buildResponse(payee, amount, lang), lang));
  } catch (err) {
    console.error("pay failed:", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "Could not process the request" });
  }
});

/** Map the parsed {payee, amount} onto the envelope the app switches on. */
function buildResponse(
  payee: string | null,
  amount: number | null,
  lang: LanguageCode,
): PayResponse {
  const r = replies[lang];
  if (payee && amount !== null) {
    return {
      status: "confirm",
      speech: r.confirm(payee, amount),
      tts_audio: "",
      payment: { payee_name: payee, amount },
    };
  }
  if (payee) {
    return { status: "need_info", speech: r.askAmount(payee), tts_audio: "" };
  }
  if (amount !== null) {
    return { status: "need_info", speech: r.askPayee(amount), tts_audio: "" };
  }
  return { status: "not_understood", speech: r.notUnderstood, tts_audio: "" };
}

/**
 * Voice `speech` into `tts_audio`. A TTS failure leaves it "" rather than failing the request:
 * the parse result is still useful, and the app falls back to showing `speech` as text.
 */
async function withSpeech(response: PayResponse, lang: LanguageCode): Promise<PayResponse> {
  try {
    return { ...response, tts_audio: await synthesize(response.speech, lang) };
  } catch (err) {
    console.error("tts failed:", err instanceof Error ? err.message : err);
    return response;
  }
}
