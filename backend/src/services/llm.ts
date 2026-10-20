import { z } from "zod";
import { config } from "../config.js";
import {
  LLM_MAX_ATTEMPTS,
  LLM_MAX_TOKENS,
  LLM_TIMEOUT_MS,
  MAX_AMOUNT,
  MIN_AMOUNT,
} from "../constants.js";
import { UpstreamError, withRetry } from "./upstream.js";

export interface ExtractedPayment {
  payee: string | null;
  amount: number | null;
}

// We ask for a tiny, strict JSON object. The direction guard, honorific stripping and (for
// agglutinative languages) case endings fused onto the name are the parts most likely to trip a
// weaker extractor, so they get explicit examples. STT returns each language in its native
// script, so the examples do too.
const SYSTEM_PROMPT = `You extract UPI payment details from a short spoken instruction.
The instruction may be in English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Tamil or Telugu, usually written in that language's own script.

Return ONLY a JSON object, nothing else, in exactly this shape:
{"payee": <string or null>, "amount": <integer or null>}

Rules:
- "payee" is the person who RECEIVES the money. If the sentence describes receiving money (e.g. "I got 5000 from Ramu"), it is NOT a payment to them: set payee to null.
- Return only the bare name. Strip case endings and postpositions attached to it: "रामू को", "ராமுக்கு", "రాముకి", "ರಾಮುಗೆ", "রামুকে", "रामूला" -> "Ramu".
- Strip honorifics and relations in any language: "Ramesh uncle" -> "Ramesh", "my son Ramu" -> "Ramu"; also ji, bhai, anna, akka, garu, da, di, kaka, mama, chechi, aunty.
- Write "payee" in Latin (English) script even if the instruction is in another language.
- "amount" is a positive whole number of rupees. Convert words and units in any language: "5k"/"paanch hazaar"/"5 thousand" -> 5000, "5 lakh" -> 500000, "500 rupaye"/"₹500" -> 500; e.g. ஆயிரம், వెయ్యి, ಸಾವಿರ = thousand, লাখ/लाख = lakh. Digits may be in any Indian script: "५००", "৫০০", "૫૦૦" -> 500. Round any paise to the nearest rupee.
- If a value was not stated, use null for it. Never invent a name or an amount.

Examples:
"send Ramu 5000" -> {"payee": "Ramu", "amount": 5000}
"please give 5000 to Ramu" -> {"payee": "Ramu", "amount": 5000}
"Ramu needs to be given 5000" -> {"payee": "Ramu", "amount": 5000}
"I received 5000 from Ramu" -> {"payee": null, "amount": 5000}
"pay Ramesh uncle" -> {"payee": "Ramesh", "amount": null}
"paanch hazaar Ramu ko bhej do" -> {"payee": "Ramu", "amount": 5000}
"रामू को 500 भेज दो" -> {"payee": "Ramu", "amount": 500}
"ராமுக்கு 500 ரூபாய் அனுப்பு" -> {"payee": "Ramu", "amount": 500}
"రాముకి వెయ్యి రూపాయలు పంపు" -> {"payee": "Ramu", "amount": 1000}
"ರಮೇಶ್ ಅಣ್ಣನಿಗೆ ಎರಡು ಸಾವಿರ ಕಳುಹಿಸು" -> {"payee": "Ramesh", "amount": 2000}
"सुरेश काकांना पाच हजार पाठव" -> {"payee": "Suresh", "amount": 5000}
"রামুর কাছ থেকে ৫০০ টাকা পেয়েছি" -> {"payee": null, "amount": 500}`;

const parsedSchema = z.object({
  payee: z.string().nullable(),
  amount: z.number().nullable(),
});

/** Extract {payee, amount} from a transcript. */
export async function extractPayment(transcript: string): Promise<ExtractedPayment> {
  if (!config.LLM_API_KEY) {
    throw new UpstreamError("LLM_API_KEY is not set");
  }
  return withRetry(() => callLlm(transcript), LLM_MAX_ATTEMPTS);
}

async function callLlm(transcript: string): Promise<ExtractedPayment> {
  const res = await fetch(config.LLM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.LLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.LLM_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      temperature: 0,
      max_tokens: LLM_MAX_TOKENS,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  const body = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string } | string;
  } | null;

  if (!res.ok) {
    const detail =
      typeof body?.error === "string" ? body.error : (body?.error?.message ?? res.statusText);
    throw new UpstreamError(`LLM request failed (${res.status}) ${detail}`, res.status);
  }

  return parseExtraction(body?.choices?.[0]?.message?.content?.trim() ?? "");
}

function parseExtraction(raw: string): ExtractedPayment {
  // Take the outermost {...} so a stray code fence or leading token can't fool us.
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new UpstreamError(`LLM returned no JSON object: ${raw.slice(0, 200)}`);
  }

  let parsed: z.infer<typeof parsedSchema>;
  try {
    parsed = parsedSchema.parse(JSON.parse(match[0]));
  } catch {
    throw new UpstreamError(`LLM returned unparseable JSON: ${match[0].slice(0, 200)}`);
  }

  const payee = parsed.payee?.trim() ? parsed.payee.trim() : null;
  const amount =
    parsed.amount !== null &&
    Number.isInteger(parsed.amount) &&
    parsed.amount >= MIN_AMOUNT &&
    parsed.amount <= MAX_AMOUNT
      ? parsed.amount
      : null;

  return { payee, amount };
}
