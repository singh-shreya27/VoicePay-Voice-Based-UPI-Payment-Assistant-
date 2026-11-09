import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE_IN_OUT, lerp } from '../lib/anim';
import { TRANSITION } from '../timeline';

/**
 * Wraps a scene and cross-fades it: fade/scale/de-blur in at the start,
 * fade/blur out over the last TRANSITION frames (which overlap the next scene).
 */
export const SceneShell: React.FC<{
  length: number; // frames this scene's Sequence lasts, including the overlap
  fadeIn?: boolean;
  fadeOut?: boolean;
  children: React.ReactNode;
}> = ({ length, fadeIn = true, fadeOut = true, children }) => {
  const f = useCurrentFrame();
  const inP = fadeIn ? lerp(f, [0, TRANSITION], [0, 1], EASE_IN_OUT) : 1;
  const outP = fadeOut ? lerp(f, [length - TRANSITION, length], [0, 1], EASE_IN_OUT) : 0;
  const opacity = Math.min(inP, 1 - outP);
  const scale = 1 + (1 - inP) * 0.03 - outP * 0.03;
  const blur = (1 - inP) * 10 + outP * 10;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
