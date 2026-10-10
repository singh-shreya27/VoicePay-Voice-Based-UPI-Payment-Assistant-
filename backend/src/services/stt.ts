/** Speech-to-text: audio bytes in, transcript out. */
export async function transcribe(_audio: Buffer): Promise<string> {
  throw new Error("transcribe not implemented");
}
