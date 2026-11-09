/** A failed call to an external service (STT, LLM or TTS). `status` is the HTTP status, if any. */
export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

/**
 * Run `fn`, retrying transient failures with exponential backoff (300 ms, 600 ms, ...).
 * Network errors and timeouts (anything that is not an UpstreamError), 429 and 5xx are retried.
 * Other 4xx means our request is wrong, and an UpstreamError without a status means the response
 * was unusable; both would just repeat, so they are thrown straight away.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxAttempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable =
        !(err instanceof UpstreamError) ||
        (err.status !== undefined && (err.status === 429 || err.status >= 500));
      if (!retryable || attempt === maxAttempts) break;
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}
