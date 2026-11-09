// ─────────────────────────────────────────────────────────────────────────────
// AUDIO
//
// Files live in video/public/audio/. Paths below are relative to public/.
// A `file` of null renders no audio element, so a missing file never breaks
// the render.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One narration line, cut from the voiceover recording.
 * `from`/`to` are seconds in the recording (cut points sit in silent gaps),
 * `shift` is how many seconds to move the line later (+) or earlier (−) so it
 * lands on its scene. Shift 0 = play exactly where it is in the recording.
 */
export type VoiceClip = { line: number; from: number; to: number; shift: number };

export type VoiceoverConfig = {
  /** Path inside public/, or null for no narration. */
  file: string | null;
  volume: number;
  /** If empty, the whole file plays from frame 0. */
  clips: VoiceClip[];
};

export type MusicConfig = {
  /** Path inside public/, or null for no background music. */
  file: string | null;
  /** Normal music volume. */
  volume: number;
  /** Volume while a narration caption is on screen (only used if a voiceover is set). */
  duckedVolume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  /** Loop the track if it is shorter than 60 s. */
  loop: boolean;
};

// voiceover.wav is 60.36 s. Speech was measured from the waveform; each line is
// nudged onto its scene (and line 9 slightly earlier so it ends before 1:00).
export const VOICEOVER: VoiceoverConfig = {
  file: 'audio/voiceover.wav',
  volume: 1,
  clips: [
    { line: 1, from: 0.0, to: 5.85, shift: 0 }, //      speech 0.05–5.45  → hook
    { line: 2, from: 5.85, to: 10.1, shift: 0 }, //     speech 6.25–9.80  → intro
    { line: 3, from: 10.1, to: 15.5, shift: 0 }, //     speech 10.40–14.55 → home
    { line: 4, from: 15.5, to: 23.9, shift: 1.35 }, //  speech 16.55–22.15 → speak (17.90–23.50)
    { line: 5, from: 23.9, to: 32.0, shift: 1.6 }, //   speech 25.75–30.35 → understand (27.35–31.95)
    { line: 6, from: 32.0, to: 39.9, shift: 0.6 }, //   speech 33.70–38.30 → confirm (34.30–38.90)
    { line: 7, from: 39.9, to: 48.1, shift: 0.6 }, //   speech 41.65–46.45 → pay (42.25–47.05)
    { line: 8, from: 48.1, to: 54.05, shift: 0.3 }, //  speech 49.90–53.45 → result (50.20–53.75)
    { line: 9, from: 54.05, to: 60.36, shift: -0.25 }, // speech 54.70–60.15 → outro (54.45–59.90)
  ],
};

export const MUSIC: MusicConfig = {
  file: null, // e.g. 'audio/music.mp3'
  volume: 0.35,
  duckedVolume: 0.12,
  fadeInFrames: 30,
  fadeOutFrames: 60,
  loop: true,
};
