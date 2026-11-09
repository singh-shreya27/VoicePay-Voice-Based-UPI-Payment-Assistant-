import { Easing, interpolate, spring } from 'remotion';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

/** interpolate() with clamping on both sides. */
export const lerp = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = (t) => t,
): number =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** A spring that starts at `delay` and stays at 0 before it. */
export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
): number =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8, ...config },
  });

/** Fade in over [a, a+len] and fade out over [b-len, b]. */
export const fadeWindow = (frame: number, a: number, b: number, len = 10): number =>
  Math.min(lerp(frame, [a, a + len], [0, 1]), lerp(frame, [b - len, b], [1, 0]));
