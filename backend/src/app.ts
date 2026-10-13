import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { payRouter } from "./routes/pay.js";

export const app = express();

app.use(cors());
// Audio is sent base64-encoded in JSON, so allow a larger body.
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/pay", payRouter);

// TEMP dev tool: STT recorder UI. Remove this line and the dev-stt-tester/ folder after testing.
app.use("/tester", express.static("dev-stt-tester"));

// Must be registered last and take four arguments: that is how Express recognises an
// error handler. It keeps every error response JSON and hides stack traces from clients.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  if (status >= 500) {
    console.error("unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
  res.status(status).json({
    error: status === 413 ? "Request body is too large" : "Invalid request body",
  });
};
app.use(errorHandler);
