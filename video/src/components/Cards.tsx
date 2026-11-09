import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha, C } from '../theme';
import { lerp, pop } from '../lib/anim';
import { Icon, IconName } from './Icon';

export const glass = (accent: string = C.indigo300): React.CSSProperties => ({
  background: 'linear-gradient(160deg, rgba(29,33,48,0.92), rgba(21,24,35,0.86))',
  border: `1.5px solid ${alpha(accent, 0.22)}`,
  boxShadow: `0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
  borderRadius: 28,
});

/** Icon in a rounded tinted square, like the app's list icons. */
export const IconTile: React.FC<{ name: IconName; color?: string; size?: number }> = ({
  name,
  color = C.indigo300,
  size = 60,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: alpha(color, 0.15),
      border: `1.5px solid ${alpha(color, 0.3)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Icon name={name} size={size * 0.55} color={color} />
  </div>
);

/** A single feature line with an icon, popping in at `delay`. */
export const FeatureRow: React.FC<{ icon: IconName; text: string; delay: number; color?: string }> = ({
  icon,
  text,
  delay,
  color = C.indigo300,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay, { damping: 18 });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        opacity: p,
        transform: `translateX(${(1 - p) * -40}px)`,
      }}
    >
      <IconTile name={icon} color={color} size={56} />
      <div style={{ fontSize: 31, fontWeight: 600, color: C.slate100 }}>{text}</div>
    </div>
  );
};

/**
 * Checklist synced to the phone overlays: the item whose time has come is
 * "active" (glowing), earlier items show a teal tick, later ones are hidden.
 */
export const StepList: React.FC<{ items: Array<{ at: number; text: string }>; numbered?: boolean }> = ({
  items,
  numbered = false,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const activeIdx = items.reduce((acc, it, i) => (f >= it.at ? i : acc), -1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((it, i) => {
        const p = pop(f, fps, it.at, { damping: 18 });
        const active = i === activeIdx;
        const done = i < activeIdx;
        const glow = active ? 0.5 + 0.5 * Math.sin((f - it.at) / 7) : 0;
        const accent = done ? C.teal300 : C.indigo300;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 24px',
              borderRadius: 22,
              background: active ? alpha(C.indigo600, 0.2) : 'rgba(29,33,48,0.55)',
              border: `1.5px solid ${active ? alpha(C.indigo300, 0.6) : alpha(C.slate500, 0.25)}`,
              boxShadow: active ? `0 0 ${18 + glow * 18}px ${alpha(C.indigo600, 0.45)}` : 'none',
              opacity: lerp(p, [0, 0.5], [0, done ? 0.75 : 1]),
              transform: `translateX(${(1 - p) * -40}px)`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: done ? C.teal300 : active ? C.indigo600 : C.indigo800,
                color: '#fff',
                fontWeight: 800,
                fontSize: 22,
                boxShadow: active ? `0 0 16px ${C.indigo600}` : 'none',
              }}
            >
              {done ? <Icon name="check" size={28} color={C.slate950} /> : numbered ? i + 1 : <Icon name="check" size={26} color={accent} />}
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.slate50, lineHeight: 1.25 }}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Rounded pill with an icon (used on the end card). */
export const Pill: React.FC<{ icon: IconName; text: string; delay: number; color?: string }> = ({
  icon,
  text,
  delay,
  color = C.indigo300,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay, { damping: 13 });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 26px',
        borderRadius: 999,
        background: alpha(color, 0.1),
        border: `1.5px solid ${alpha(color, 0.4)}`,
        boxShadow: `0 0 24px ${alpha(color, 0.18)}`,
        color: C.slate50,
        fontSize: 27,
        fontWeight: 700,
        opacity: lerp(p, [0, 0.5], [0, 1]),
        transform: `translateY(${(1 - p) * 30}px) scale(${lerp(p, [0, 1], [0.8, 1])})`,
      }}
    >
      <Icon name={icon} size={30} color={color} />
      {text}
    </div>
  );
};
