import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha, C } from '../theme';
import { lerp } from '../lib/anim';

/** Thin gradient progress line along the bottom edge. */
export const ProgressBar: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = f / (durationInFrames - 1);
  const op = lerp(f, [durationInFrames - 30, durationInFrames - 10], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: alpha(C.slate700, 0.6), opacity: op }}>
      <div
        style={{
          width: `${p * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${C.indigo600}, ${C.violet600}, ${C.teal300})`,
          boxShadow: `0 0 14px ${C.violet600}`,
        }}
      />
    </div>
  );
};
