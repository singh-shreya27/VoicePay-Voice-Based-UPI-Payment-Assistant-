import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { alpha, C } from '../theme';
import { lerp, pop } from '../lib/anim';

/** A chat-style bubble that types out `text` between `typeFrom` and `typeTo`. */
export const SpeechBubble: React.FC<{
  text: string;
  translation?: string;
  appearAt: number;
  typeFrom: number;
  typeTo: number;
}> = ({ text, translation, appearAt, typeFrom, typeTo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, appearAt, { damping: 14 });
  const chars = Math.round(lerp(f, [typeFrom, typeTo], [0, text.length]));
  const typing = f >= typeFrom && f < typeTo + 20;
  const cursorOn = typing && Math.floor(f / 8) % 2 === 0;
  const transOp = lerp(f, [typeTo + 6, typeTo + 20], [0, 1]);

  return (
    <div
      style={{
        position: 'relative',
        alignSelf: 'flex-start',
        padding: '26px 36px',
        borderRadius: '34px 34px 34px 8px',
        background: `linear-gradient(135deg, ${alpha(C.indigo600, 0.95)}, ${alpha(C.violet600, 0.95)})`,
        boxShadow: `0 24px 60px ${alpha(C.violet600, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.25)`,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${lerp(p, [0, 1], [0.85, 1])})`,
        transformOrigin: 'left bottom',
      }}
    >
      <div style={{ fontSize: 50, fontWeight: 800, color: '#fff', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
        <span>“{text.slice(0, chars)}</span>
        <span style={{ opacity: chars >= text.length ? 1 : 0 }}>”</span>
        <span
          style={{
            display: 'inline-block',
            width: 4,
            height: 46,
            marginLeft: 4,
            verticalAlign: -6,
            background: '#fff',
            opacity: cursorOn ? 1 : 0,
          }}
        />
      </div>
      {translation && (
        <div style={{ marginTop: 8, fontSize: 26, fontWeight: 500, color: C.indigo100, opacity: transOp }}>
          {translation}
        </div>
      )}
    </div>
  );
};
