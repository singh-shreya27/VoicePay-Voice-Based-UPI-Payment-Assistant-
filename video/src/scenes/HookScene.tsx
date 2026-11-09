import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { glass, IconTile } from '../components/Cards';
import { IconName } from '../components/Icon';
import { Kicker, LeftColumn, RevealText, SubText } from '../components/SceneTitle';
import { C } from '../theme';
import { lerp, pop } from '../lib/anim';

// The problem, taken from the README's "Why VoicePay" section.
const PAINS: Array<{ icon: IconName; title: string; sub: string }> = [
  { icon: 'apps', title: 'Crowded screens', sub: 'Offers, banners and menus everywhere' },
  { icon: 'keyboard', title: 'Tiny keyboards', sub: 'Easy to type 5000 instead of 500' },
  { icon: 'translate', title: 'English-only menus', sub: 'When Hindi or Tamil feels natural' },
  { icon: 'warning', title: 'Fear of mistakes', sub: 'What if it goes to the wrong person?' },
];

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <LeftColumn>
        <Kicker text="The problem" color={C.amber300} delay={4} />
        <div>
          <RevealText text="UPI is everywhere." delay={10} size={84} />
          <div style={{ height: 12 }} />
          <RevealText text="But paying can still feel *hard.*" delay={38} size={84} />
        </div>
        <SubText delay={70}>For many elders, the hard part isn’t the payment. It’s everything around it.</SubText>
      </LeftColumn>

      <div
        style={{
          position: 'absolute',
          left: 1060,
          top: 210,
          width: 760,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 28,
        }}
      >
        {PAINS.map((p, i) => {
          const s = pop(f, fps, 56 + i * 12, { damping: 15 });
          const float = Math.sin(f / 30 + i * 1.7) * 6;
          const shake = i === 3 ? Math.sin(f * 0.9) * lerp(f, [120, 130, 150], [0, 2, 0]) : 0;
          return (
            <div
              key={p.title}
              style={{
                ...glass(C.amber300),
                padding: 30,
                minHeight: 262,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                opacity: lerp(s, [0, 0.5], [0, 1]),
                transform: `translateY(${(1 - s) * 60 + float}px) rotate(${(1 - s) * (i % 2 ? 6 : -6) + shake}deg) scale(${lerp(s, [0, 1], [0.85, 1])})`,
              }}
            >
              <IconTile name={p.icon} color={C.amber300} />
              <div style={{ fontSize: 32, fontWeight: 800, color: C.slate50 }}>{p.title}</div>
              <div style={{ fontSize: 23, fontWeight: 500, color: C.slate300, lineHeight: 1.35 }}>{p.sub}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};
