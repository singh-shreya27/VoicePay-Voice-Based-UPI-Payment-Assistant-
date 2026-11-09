import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { LogoMark } from '../components/Logo';
import { RevealText, SubText } from '../components/SceneTitle';
import { alpha, C } from '../theme';
import { EASE_OUT, lerp, pop } from '../lib/anim';

const NAME = 'VoicePay';

export const IntroScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(f, fps, 2, { damping: 11, stiffness: 100 });
  const ring = (delay: number) => lerp(f, [delay, delay + 50], [0, 1], EASE_OUT);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 90 }}>
      <div style={{ position: 'relative', marginBottom: 56 }}>
        {/* Shockwave rings from the logo */}
        {[0, 14, 28].map((d) => {
          const t = ring(4 + d);
          const size = 240 + t * 900;
          return (
            <div
              key={d}
              style={{
                position: 'absolute',
                left: 95 - size / 2,
                top: 95 - size / 2,
                width: size,
                height: size,
                borderRadius: '50%',
                border: `2px solid ${alpha(C.indigo300, 0.6)}`,
                opacity: t > 0 ? (1 - t) * 0.8 : 0,
              }}
            />
          );
        })}
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -30}deg)` }}>
          <LogoMark size={190} />
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 132, fontWeight: 800, letterSpacing: -4, color: C.slate50 }}>
        {NAME.split('').map((ch, i) => {
          const p = pop(f, fps, 14 + i * 2.5, { damping: 13 });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: lerp(p, [0, 0.5], [0, 1]),
                transform: `translateY(${(1 - p) * 70}px)`,
                filter: `blur(${(1 - p) * 10}px)`,
                color: i >= 5 ? C.indigo300 : C.slate50,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        <RevealText text="Pay anyone, *just* *by* *saying* *it.*" delay={40} size={56} weight={700} align="center" />
      </div>
      <div style={{ marginTop: 22 }}>
        <SubText delay={66} align="center" size={28}>
          Voice-assisted UPI payments, designed for elderly users
        </SubText>
      </div>
    </AbsoluteFill>
  );
};
