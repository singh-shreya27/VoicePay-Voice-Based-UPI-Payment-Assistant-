import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { glass, IconTile } from '../components/Cards';
import { Icon, IconName } from '../components/Icon';
import { Kicker, RevealText } from '../components/SceneTitle';
import { Waveform } from '../components/Waveform';
import { MONO } from '../fonts';
import { alpha, C } from '../theme';
import { EASE_OUT, lerp, pop } from '../lib/anim';

// The real /pay pipeline from the README: speech-to-text → LLM → contact matching on the phone.
const CARD_W = 370;
const CARD_H = 320;
const GAP = 66;
const LEFT = (1920 - (CARD_W * 4 + GAP * 3)) / 2;
const TOP = 345;
const appear = (i: number) => 24 + i * 26;

const Card: React.FC<{ i: number; icon: IconName; label: string; color?: string; children: React.ReactNode }> = ({
  i,
  icon,
  label,
  color = C.indigo300,
  children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, appear(i), { damping: 15 });
  const float = Math.sin(f / 26 + i) * 5;
  return (
    <div
      style={{
        ...glass(color),
        position: 'absolute',
        left: LEFT + i * (CARD_W + GAP),
        top: TOP,
        width: CARD_W,
        height: CARD_H,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        opacity: lerp(p, [0, 0.5], [0, 1]),
        transform: `translateY(${(1 - p) * 70 + float}px) scale(${lerp(p, [0, 1], [0.85, 1])})`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 40px ${alpha(color, 0.15 * p)}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IconTile name={icon} color={color} size={54} />
        <div style={{ fontSize: 27, fontWeight: 800, color: C.slate50 }}>{label}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</div>
    </div>
  );
};

const Connector: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const start = appear(i) + 14;
  const grow = lerp(f, [start, start + 14], [0, 1], EASE_OUT);
  const x = LEFT + (i + 1) * CARD_W + i * GAP + 6;
  const w = GAP - 12;
  const y = TOP + CARD_H / 2;
  return (
    <div style={{ position: 'absolute', left: x, top: y - 2, width: w, height: 4 }}>
      <div
        style={{
          width: `${grow * 100}%`,
          height: '100%',
          borderRadius: 2,
          background: `linear-gradient(90deg, ${C.indigo300}, ${C.violet600})`,
          boxShadow: `0 0 12px ${C.violet600}`,
        }}
      />
      {grow >= 1 &&
        [0, 0.5].map((o) => {
          const t = (((f - start) / 22 + o) % 1 + 1) % 1;
          return (
            <div
              key={o}
              style={{
                position: 'absolute',
                left: t * w - 6,
                top: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: `0 0 14px ${C.indigo300}`,
                opacity: Math.sin(t * Math.PI),
              }}
            />
          );
        })}
    </div>
  );
};

export const UnderstandScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const note = pop(f, fps, 130, { damping: 18 });
  const typed = (text: string, from: number) => text.slice(0, Math.round(lerp(f, [from, from + 26], [0, text.length])));

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <Kicker text="Behind the scenes" delay={2} />
        <RevealText text="Who, and how much? *Understood.*" delay={8} size={70} align="center" />
      </div>

      <Card i={0} icon="mic" label="You say">
        <Waveform width={CARD_W - 56} height={70} bars={30} level={(fr) => 0.35 + 0.35 * Math.abs(Math.sin(fr * 0.15))} />
        <div style={{ marginTop: 18, fontSize: 25, fontWeight: 600, color: C.slate100 }}>“Geeta ko 2 rupaye bhej do”</div>
      </Card>

      <Card i={1} icon="text" label="Speech to text">
        <div
          style={{
            fontFamily: MONO,
            fontSize: 24,
            color: C.indigo100,
            background: alpha(C.slate950, 0.6),
            borderRadius: 14,
            padding: '16px 18px',
            minHeight: 96,
            lineHeight: 1.4,
          }}
        >
          {typed('geeta ko 2 rupaye bhej do', appear(1) + 10)}
        </div>
        <div style={{ marginTop: 14, fontSize: 20, color: C.slate300 }}>Hindi selected, 1 of 10 languages</div>
      </Card>

      <Card i={2} icon="sparkle" label="AI extracts" color={C.violet600}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            lineHeight: 1.55,
            color: C.slate100,
            background: alpha(C.slate950, 0.6),
            borderRadius: 14,
            padding: '16px 18px',
            opacity: lerp(f, [appear(2) + 8, appear(2) + 18], [0, 1]),
          }}
        >
          {'{'}
          <br />
          &nbsp;&nbsp;<span style={{ color: C.indigo300 }}>"payee"</span>: <span style={{ color: C.teal300 }}>"Geeta"</span>,
          <br />
          &nbsp;&nbsp;<span style={{ color: C.indigo300 }}>"amount"</span>: <span style={{ color: C.amber300 }}>2</span>
          <br />
          {'}'}
        </div>
      </Card>

      <Card i={3} icon="phone" label="Matched on phone" color={C.teal300}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: C.indigo800,
              color: C.indigo100,
              fontSize: 36,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.slate50 }}>Geeta</div>
            <div style={{ fontSize: 22, color: C.slate300 }}>geetaverma@oksbi</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 999,
            background: alpha(C.teal300, 0.15),
            color: C.teal300,
            fontSize: 20,
            fontWeight: 700,
            opacity: lerp(f, [appear(3) + 18, appear(3) + 28], [0, 1]),
          }}
        >
          <Icon name="check" size={20} color={C.teal300} /> Saved contact
        </div>
      </Card>

      {[0, 1, 2].map((i) => (
        <Connector key={i} i={i} />
      ))}

      <div
        style={{
          position: 'absolute',
          top: TOP + CARD_H + 64,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: note,
          transform: `translateY(${(1 - note) * 20}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 600, color: C.slate100 }}>
          <Icon name="shield" size={38} color={C.teal300} />
          The AI never sees or invents a UPI ID. Names are matched only to your saved contacts.
        </div>
      </div>
    </AbsoluteFill>
  );
};
