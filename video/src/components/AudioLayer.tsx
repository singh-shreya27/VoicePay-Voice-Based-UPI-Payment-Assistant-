import React from 'react';
import { Html5Audio, interpolate, Sequence, staticFile, useVideoConfig } from 'remotion';
import { MUSIC, VOICEOVER } from '../audio';
import { CUES } from '../captions';

/**
 * Renders the voiceover and background-music tracks configured in src/audio.ts.
 * While both are null (the default), this renders nothing.
 */
export const AudioLayer: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const hasVoice = VOICEOVER.file !== null;

  const musicVolume = (f: number) => {
    const fade = Math.min(
      interpolate(f, [0, MUSIC.fadeInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      interpolate(f, [durationInFrames - MUSIC.fadeOutFrames, durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    );
    // Duck under narration: smoothly lower the music while a caption cue is active.
    const duck = hasVoice
      ? Math.max(
          0,
          ...CUES.map((c) =>
            Math.min(
              interpolate(f, [c.from - 10, c.from], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              interpolate(f, [c.to, c.to + 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            ),
          ),
        )
      : 0;
    const level = MUSIC.volume + (MUSIC.duckedVolume - MUSIC.volume) * duck;
    return level * fade;
  };

  return (
    <>
      {MUSIC.file !== null && <Html5Audio src={staticFile(MUSIC.file)} volume={musicVolume} loop={MUSIC.loop} />}
      {VOICEOVER.file !== null && VOICEOVER.clips.length === 0 && (
        <Html5Audio src={staticFile(VOICEOVER.file)} volume={VOICEOVER.volume} />
      )}
      {VOICEOVER.file !== null &&
        VOICEOVER.clips.map((clip) => (
          // Each line plays its slice of the recording, moved by `shift` seconds.
          <Sequence
            key={clip.line}
            name={`Voiceover line ${clip.line}`}
            from={Math.round((clip.from + clip.shift) * fps)}
            durationInFrames={Math.round((clip.to - clip.from) * fps)}
            layout="none"
          >
            <Html5Audio
              src={staticFile(VOICEOVER.file as string)}
              trimBefore={Math.round(clip.from * fps)}
              volume={VOICEOVER.volume}
            />
          </Sequence>
        ))}
    </>
  );
};
