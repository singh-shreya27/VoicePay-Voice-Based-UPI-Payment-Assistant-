import { Router } from "express";
import type { PayResponse } from "../types.js";

export const payRouter = Router();

// Stub: will become audio -> STT -> LLM -> TTS.
payRouter.post("/", (_req, res) => {
  const body: PayResponse = {
    status: "not_understood",
    speech: "Sorry, I could not understand that.",
    tts_audio: "",
  };
  res.json(body);
});
