import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { alpha, C } from '../theme';

/**
 * Animated voice waveform. Bar heights are a deterministic mix of sine waves
 * (no Math.random), so every render produces identical frames.
 *
 * `level(frame)` returns 0–1 loudness for the current frame.
 */
export const Waveform: React.FC<{
  width: number;
  height: number;
  bars?: number;
  level: (frame: number) => number;
  colors?: [string, string, string];
}> = ({ width, height, bars = 56, level, colors = [C.indigo300, C.violet600, C.teal300] }) => {
  const f = useCurrentFrame();
  const amp = level(f);
  const gap = 6;
  const barW = (width - gap * (bars - 1)) / bars;
  return (
    <div style={{ position: 'relative', width, height, display: 'flex', alignItems: 'center', gap }}>
      {Array.from({ length: bars }, (_, i) => {
        const x = i / (bars - 1);
        const envelope = Math.exp(-Math.pow((x - 0.5) / 0.3, 2)); // louder in the middle
        const seed = random(`w-${i}`);
        const wave =
          0.55 * Math.abs(Math.sin(f * 0.21 + i * 0.55 + seed * 6)) +
          0.3 * Math.abs(Math.sin(f * 0.37 - i * 0.31)) +
          0.15 * Math.abs(Math.sin(f * 0.9 + seed * 20));
        const h = Math.max(6, height * (0.06 + 0.94 * amp * envelope * wave));
        const color = x < 0.5 ? colors[0] : colors[2];
        return (
          <div
            key={i}
            style={{
              width: barW,
              height: h,
              borderRadius: barW,
              background: `linear-gradient(180deg, ${color}, ${colors[1]})`,
              boxShadow: `0 0 ${10 + amp * 14}px ${alpha(colors[1], 0.55)}`,
            }}
          />
        );
      })}
    </div>
  );
};
