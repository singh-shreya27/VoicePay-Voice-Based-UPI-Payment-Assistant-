import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha, C, TEXT_GRADIENT } from '../theme';
import { lerp, pop } from '../lib/anim';

/** Small uppercase label above a title, e.g. "STEP 1 · TAP". */
export const Kicker: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = C.indigo300,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay, { damping: 20 });
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 20px',
        borderRadius: 999,
        background: alpha(color, 0.12),
        border: `1.5px solid ${alpha(color, 0.35)}`,
        color,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <span
        style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }}
      />
      {text}
    </div>
  );
};

/**
 * Headline that reveals word by word (spring + de-blur).
 * Words wrapped in *asterisks* get the brand text gradient.
 */
export const RevealText: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  stagger?: number;
  color?: string;
  align?: 'left' | 'center';
  lineHeight?: number;
}> = ({ text, delay = 0, size = 76, weight = 800, stagger = 3, color = C.slate50, align = 'left', lineHeight = 1.08 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: -size * 0.025,
        color,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
      }}
    >
      {words.map((w, i) => {
        const p = pop(f, fps, delay + i * stagger, { damping: 16, stiffness: 110 });
        const accent = w.startsWith('*') && w.endsWith('*');
        const clean = accent ? w.slice(1, -1) : w;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: lerp(p, [0, 0.6], [0, 1]),
              transform: `translateY(${(1 - p) * size * 0.5}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
              ...(accent
                ? {
                    backgroundImage: TEXT_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    paddingBottom: size * 0.08,
                  }
                : {}),
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};

/** Supporting paragraph that fades/slides in. */
export const SubText: React.FC<{ children: React.ReactNode; delay?: number; size?: number; align?: 'left' | 'center' }> = ({
  children,
  delay = 0,
  size = 32,
  align = 'left',
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay, { damping: 22 });
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.4,
        fontWeight: 500,
        color: C.slate300,
        textAlign: align,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Left-hand text column used next to the phone. */
export const LeftColumn: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: 130,
      width: 880,
      top: 0,
      bottom: 110,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 30,
      alignItems: 'flex-start',
      transform: `translateY(${top}px)`,
    }}
  >
    {children}
  </div>
);
