// Narration script, shown as on-screen subtitles and spoken in public/audio/voiceover.wav.
// Each cue is timed to when its line is heard in the video (after the per-line
// shifts in src/audio.ts). Frames are absolute (30 fps). Cue timing is also
// used to duck background music under the narration.

export type Cue = { from: number; to: number; text: string };

export const CUES: Cue[] = [
  { from: 0, to: 172, text: 'UPI is everywhere. But for many elders, paying still feels hard.' }, //            0.05–5.45 s
  { from: 184, to: 298, text: 'Meet VoicePay. Pay anyone, just by saying it.' }, //                              6.25–9.80 s
  { from: 308, to: 456, text: 'Tap one big button. Your language and contacts are right there.' }, //            10.40–14.55 s
  { from: 533, to: 722, text: 'Just say it: “Geeta ko 2 rupaye bhej do.” In any of 10 Indian languages.' }, //   17.90–23.50 s
  { from: 816, to: 976, text: 'VoicePay works out who and how much, then finds them in your saved contacts.' }, // 27.35–31.95 s
  { from: 1025, to: 1186, text: 'It reads the payment back aloud. Nothing happens until you tap Confirm.' }, //    34.30–38.90 s
  { from: 1263, to: 1430, text: 'It copies the UPI ID and guides you to pay in your own UPI app.' }, //            42.25–47.05 s
  { from: 1502, to: 1626, text: 'Back in VoicePay, tap “Yes, I paid”, and you’re done.' }, //                      50.20–53.75 s
  { from: 1630, to: 1800, text: 'VoicePay. Speak, confirm, pay. Safely, in your language.' }, //                    54.45–59.90 s
];
