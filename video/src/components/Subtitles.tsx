import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CUES } from '../captions';
import { alpha, C } from '../theme';
import { lerp } from '../lib/anim';

/** Narration subtitles in a lower-third pill. Text comes from captions.ts. */
export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const cue = CUES.find((c) => f >= c.from && f < c.to);
  if (!cue) return null;
  const op = Math.min(lerp(f, [cue.from, cue.from + 8], [0, 1]), lerp(f, [cue.to - 8, cue.to], [1, 0]));
  const rise = lerp(f, [cue.from, cue.from + 10], [12, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 46,
        display: 'flex',
        justifyContent: 'center',
        opacity: op,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          padding: '14px 30px',
          borderRadius: 18,
          background: 'rgba(10,11,17,0.78)',
          border: `1px solid ${alpha(C.indigo300, 0.18)}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          color: C.slate50,
          fontSize: 31,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: 'center',
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
