import React from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha, C } from '../theme';
import { EASE_OUT, lerp, pop } from '../lib/anim';
import { SHOT_W, useScreenScale } from './PhoneFrame';
import { Icon, IconName } from './Icon';

// All coordinates below are in screenshot pixels (720×1600), so effects line
// up exactly with the real UI regardless of how large the phone is drawn.

type Rect = { x: number; y: number; w: number; h: number; r?: number };

/** Dims the whole display except one rounded rectangle. Clipped to the display. */
export const Spotlight: React.FC<Rect & { start: number; end?: number; dim?: number }> = ({
  x,
  y,
  w,
  h,
  r = 28,
  start,
  end,
  dim = 0.6,
}) => {
  const f = useCurrentFrame();
  const s = useScreenScale();
  const op = Math.min(lerp(f, [start, start + 10], [0, 1]), end === undefined ? 1 : lerp(f, [end, end + 10], [1, 0]));
  if (op <= 0) return null;
  const pad = 8;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 49 }}>
      <div
        style={{
          position: 'absolute',
          left: (x - pad) * s,
          top: (y - pad) * s,
          width: (w + pad * 2) * s,
          height: (h + pad * 2) * s,
          borderRadius: (r + pad) * s,
          boxShadow: `0 0 0 2000px rgba(5,6,12,${dim * op})`,
        }}
      />
    </div>
  );
};

/** A glowing, gently pulsing outline around a UI element. */
export const Highlight: React.FC<Rect & { start: number; end?: number; color?: string }> = ({
  x,
  y,
  w,
  h,
  r = 28,
  start,
  end,
  color = C.indigo300,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScreenScale();
  const p = pop(f, fps, start, { damping: 13 });
  const out = end === undefined ? 1 : lerp(f, [end, end + 10], [1, 0]);
  const op = Math.min(lerp(f, [start, start + 6], [0, 1]), out);
  if (op <= 0) return null;
  const pulse = 0.5 + 0.5 * Math.sin((f - start) / 6);
  const pad = 8;
  return (
    <div
      style={{
        position: 'absolute',
        left: (x - pad) * s,
        top: (y - pad) * s,
        width: (w + pad * 2) * s,
        height: (h + pad * 2) * s,
        borderRadius: (r + pad) * s,
        border: `3px solid ${color}`,
        boxShadow: `0 0 ${16 + pulse * 22}px ${alpha(color, 0.75)}, inset 0 0 ${14 + pulse * 10}px ${alpha(color, 0.3)}`,
        opacity: op,
        transform: `scale(${lerp(p, [0, 1], [1.12, 1])})`,
      }}
    />
  );
};

/** Concentric rings radiating out from a point: the "mic pulse". */
export const PulseRings: React.FC<{
  cx: number;
  cy: number;
  r: number;
  start?: number;
  end?: number;
  color?: string;
  count?: number;
  period?: number;
  spread?: number;
}> = ({ cx, cy, r, start = 0, end, color = C.violet600, count = 3, period = 54, spread = 0.9 }) => {
  const f = useCurrentFrame();
  const s = useScreenScale();
  const master = Math.min(lerp(f, [start, start + 12], [0, 1]), end === undefined ? 1 : lerp(f, [end, end + 12], [1, 0]));
  if (master <= 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t = ((((f - start) + (i * period) / count) % period) + period) % period / period;
        const rad = r * (1 + t * spread);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (cx - rad) * s,
              top: (cy - rad) * s,
              width: rad * 2 * s,
              height: rad * 2 * s,
              borderRadius: '50%',
              border: `${3 * (1 - t) + 1}px solid ${alpha(color, 0.9)}`,
              boxShadow: `0 0 24px ${alpha(color, 0.6)}`,
              opacity: (1 - EASE_OUT(t)) * 0.85 * master,
            }}
          />
        );
      })}
    </>
  );
};

/** A fingertip that presses and leaves a ripple at `at`. */
export const TapRipple: React.FC<{ x: number; y: number; at: number; color?: string }> = ({
  x,
  y,
  at,
  color = '#ffffff',
}) => {
  const f = useCurrentFrame();
  const s = useScreenScale();
  const local = f - at;
  if (local < -18 || local > 28) return null;
  const approach = lerp(local, [-18, 0], [0, 1], EASE_OUT);
  const press = local < 0 ? 1 : lerp(local, [0, 4, 10], [1, 0.82, 1]);
  const fingerOp = local < 0 ? approach : lerp(local, [8, 22], [1, 0]);
  const ripple = lerp(local, [0, 26], [0, 1], EASE_OUT);
  const fingerR = 46;
  return (
    <>
      {local >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: (x - 60 - ripple * 140) * s,
            top: (y - 60 - ripple * 140) * s,
            width: (120 + ripple * 280) * s,
            height: (120 + ripple * 280) * s,
            borderRadius: '50%',
            border: `4px solid ${alpha(color, 0.9)}`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: (x - fingerR) * s,
          top: (y - fingerR) * s,
          width: fingerR * 2 * s,
          height: fingerR * 2 * s,
          borderRadius: '50%',
          background: alpha(color, 0.55),
          border: `3px solid ${alpha(color, 0.95)}`,
          boxShadow: `0 0 30px ${alpha(color, 0.7)}`,
          opacity: fingerOp,
          transform: `translate(${(1 - approach) * 40}px, ${(1 - approach) * 60}px) scale(${press})`,
        }}
      />
    </>
  );
};

/** A label card to the right of the phone, joined to a point on the screen by a line. */
export const Callout: React.FC<{
  x: number;
  y: number;
  start: number;
  end?: number;
  title: string;
  sub?: string;
  icon?: IconName;
  color?: string;
}> = ({ x, y, start, end, title, sub, icon, color = C.indigo300 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScreenScale();
  const p = pop(f, fps, start, { damping: 16 });
  const out = end === undefined ? 1 : lerp(f, [end, end + 10], [1, 0]);
  const op = Math.min(lerp(f, [start, start + 6], [0, 1]), out);
  if (op <= 0) return null;
  const ax = x * s;
  const ay = y * s;
  const lineEnd = (SHOT_W + 40) * s;
  const lineW = (lineEnd - ax) * lerp(f, [start, start + 12], [0, 1], EASE_OUT);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <div
        style={{
          position: 'absolute',
          left: ax - 9,
          top: ay - 9,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 6px ${alpha(color, 0.25)}, 0 0 20px ${color}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: ax,
          top: ay - 1.5,
          width: lineW,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: lineEnd + 10,
          top: ay,
          transform: `translate(${(1 - p) * 30}px, -50%) scale(${lerp(p, [0, 1], [0.9, 1])})`,
          transformOrigin: 'left center',
          width: 270,
          padding: '16px 20px',
          borderRadius: 20,
          background: 'rgba(21,24,35,0.88)',
          border: `1.5px solid ${alpha(color, 0.45)}`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 0 24px ${alpha(color, 0.2)}`,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        {icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: alpha(color, 0.16),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={26} color={color} />
          </div>
        )}
        <div>
          <div style={{ fontSize: 23, fontWeight: 700, color: C.slate50 }}>{title}</div>
          {sub && <div style={{ fontSize: 18, fontWeight: 500, color: C.slate300, marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

/** A small pill that pops up on the screen (e.g. "UPI ID copied"). */
export const Toast: React.FC<{ x: number; y: number; start: number; end?: number; text: string; icon?: IconName; color?: string }> = ({
  x,
  y,
  start,
  end,
  text,
  icon = 'check',
  color = C.teal300,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScreenScale();
  const p = pop(f, fps, start, { damping: 11, stiffness: 160 });
  const out = end === undefined ? 1 : lerp(f, [end, end + 8], [1, 0]);
  if (f < start || out <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x * s,
        top: y * s,
        transform: `translate(-50%, -50%) scale(${p})`,
        opacity: out,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 16px',
        borderRadius: 999,
        background: color,
        color: C.slate950,
        fontSize: 19,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 26px ${alpha(color, 0.7)}`,
      }}
    >
      <Icon name={icon} size={20} color={C.slate950} />
      {text}
    </div>
  );
};

/** Celebration burst: sparks flying out from a point (seeded, deterministic). */
export const Burst: React.FC<{ cx: number; cy: number; at: number; count?: number; colors?: string[] }> = ({
  cx,
  cy,
  at,
  count = 26,
  colors = [C.teal300, C.indigo300, C.teal100, C.amber300],
}) => {
  const f = useCurrentFrame();
  const s = useScreenScale();
  const t = f - at;
  if (t < 0 || t > 50) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + random(`ba-${i}`) * 0.4;
        const dist = 150 + random(`bd-${i}`) * 230;
        const prog = EASE_OUT(Math.min(1, t / 34));
        const px = cx + Math.cos(angle) * dist * prog;
        const py = cy + Math.sin(angle) * dist * prog + t * t * 0.03;
        const size = 6 + random(`bs-${i}`) * 9;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (px - size / 2) * s,
              top: (py - size / 2) * s,
              width: size * s * 1.6,
              height: size * s * (i % 3 === 0 ? 0.7 : 1.6),
              borderRadius: i % 3 === 0 ? 2 : '50%',
              background: color,
              boxShadow: `0 0 12px ${color}`,
              opacity: lerp(t, [30, 50], [1, 0]),
              transform: `rotate(${angle + t * 0.2}rad)`,
            }}
          />
        );
      })}
    </>
  );
};

