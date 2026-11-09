import React from 'react';
import { useCurrentFrame } from 'remotion';
import { alpha, C, MIC_GRADIENT } from '../theme';
import { Icon } from './Icon';

/** The VoicePay mark: the app's indigo→violet mic button with a soft breathing glow. */
export const LogoMark: React.FC<{ size: number; glow?: number }> = ({ size, glow = 1 }) => {
  const f = useCurrentFrame();
  const breathe = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.18,
          borderRadius: '50%',
          background: C.slate800,
          boxShadow: `0 0 ${size * (0.4 + breathe * 0.25) * glow}px ${alpha(C.violet600, 0.55 * glow)}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: MIC_GRADIENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `inset 0 ${size * 0.04}px ${size * 0.1}px rgba(255,255,255,0.18)`,
        }}
      >
        <Icon name="mic" size={size * 0.48} color="#fff" />
      </div>
    </div>
  );
};
