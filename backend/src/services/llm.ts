export interface ExtractedPayment {
  payee: string | null;
  amount: number | null;
}

/** Extract {payee, amount} from a transcript. */
export async function extractPayment(_transcript: string): Promise<ExtractedPayment> {
  throw new Error("extractPayment not implemented");
}
