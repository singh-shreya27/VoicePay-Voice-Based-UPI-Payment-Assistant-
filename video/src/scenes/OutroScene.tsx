import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Cards';
import { LogoMark } from '../components/Logo';
import { RevealText } from '../components/SceneTitle';
import { C } from '../theme';
import { lerp, pop } from '../lib/anim';

export const OutroScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(f, fps, 6, { damping: 12 });
  const name = pop(f, fps, 12, { damping: 16 });
  const footer = lerp(f, [84, 100], [0, 1]);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 110 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <div style={{ transform: `scale(${logo})` }}>
          <LogoMark size={130} />
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: -4,
            color: C.slate50,
            opacity: name,
            transform: `translateX(${(1 - name) * -40}px)`,
          }}
        >
          Voice<span style={{ color: C.indigo300 }}>Pay</span>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <RevealText text="Speak. Confirm. *Pay* *safely.*" delay={22} size={58} weight={700} align="center" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 56, maxWidth: 1760 }}>
        <Pill icon="touch" text="Tap to confirm" delay={42} />
        <Pill icon="phone" text="Contacts stay on your phone" delay={50} color={C.teal300} />
        <Pill icon="lock" text="PIN stays in your UPI app" delay={58} color={C.amber300} />
        <Pill icon="translate" text="10 Indian languages" delay={66} />
      </div>

      <div
        style={{
          marginTop: 44,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: C.slate300,
          opacity: footer,
        }}
      >
        Voice-assisted UPI payments · Prototype
      </div>
    </AbsoluteFill>
  );
};
