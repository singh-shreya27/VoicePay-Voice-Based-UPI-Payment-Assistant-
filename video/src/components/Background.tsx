import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { alpha, C } from '../theme';
import { lerp } from '../lib/anim';
import { sceneEnd, sceneStart } from '../timeline';

const PARTICLES = Array.from({ length: 46 }, (_, i) => ({
  x: random(`px-${i}`) * 1920,
  y: random(`py-${i}`) * 1080,
  size: 1.5 + random(`ps-${i}`) * 3,
  speed: 0.15 + random(`pv-${i}`) * 0.45,
  phase: random(`pp-${i}`) * Math.PI * 2,
  teal: random(`pc-${i}`) > 0.7,
}));

/** Persistent animated backdrop: drifting brand-colour glows, a faint grid and floating particles. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();

  // Teal glow grows around the success moment; indigo dominates elsewhere.
  const tealBoost =
    lerp(f, [sceneStart('result') - 20, sceneStart('result') + 20], [0, 1]) *
    lerp(f, [sceneEnd('result'), sceneEnd('result') + 40], [1, 0.35]);

  const blob = (cx: number, cy: number, r: number, color: string, op: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(closest-side, ${alpha(color, op)}, ${alpha(color, 0)})`,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.slate950, overflow: 'hidden' }}>
      {blob(380 + Math.sin(f / 90) * 140, 260 + Math.cos(f / 110) * 90, 620, C.indigo600, 0.32)}
      {blob(1520 + Math.cos(f / 100) * 160, 820 + Math.sin(f / 80) * 80, 680, C.violet600, 0.26)}
      {blob(1180 + Math.sin(f / 120) * 120, 160 + Math.cos(f / 95) * 60, 420, C.teal300, 0.06 + tealBoost * 0.2)}
      {blob(560, 900, 520, C.teal600, 0.04 + tealBoost * 0.16)}

      {/* Subtle perspective grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${alpha(C.indigo300, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
            C.indigo300,
            0.05,
          )} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          backgroundPosition: `0px ${(f * 0.4) % 64}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 100%)',
        }}
      />

      {PARTICLES.map((p, i) => {
        const y = (((p.y - f * p.speed * 2) % 1080) + 1080) % 1080;
        const twinkle = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(f / 18 + p.phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x + Math.sin(f / 60 + p.phase) * 12,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.teal ? C.teal300 : C.indigo300,
              opacity: twinkle,
              boxShadow: `0 0 ${p.size * 4}px ${p.teal ? C.teal300 : C.indigo300}`,
            }}
          />
        );
      })}

      {/* Vignette */}
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(5,6,10,0.75) 100%)' }}
      />
    </AbsoluteFill>
  );
};
