import cors from "cors";
import express from "express";
import { payRouter } from "./routes/pay.js";

export const app = express();

app.use(cors());
// Audio is sent base64-encoded in JSON, so allow a larger body.
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/pay", payRouter);
