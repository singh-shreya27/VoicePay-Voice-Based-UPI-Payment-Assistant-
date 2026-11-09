// Brand palette, copied from android-app/app/src/main/java/com/example/voicepay/ui/theme/Color.kt
// so the video matches the app exactly.
export const C = {
  indigo600: '#4F46E5',
  indigo300: '#A5B4FC',
  indigo100: '#E0E7FF',
  indigo900: '#1E1B4B',
  indigo800: '#3730A3',
  violet600: '#7C3AED',

  teal600: '#0D9488',
  teal300: '#5EEAD4',
  teal100: '#CCFBF1',
  teal900: '#134E4A',
  teal800: '#115E59',

  amber700: '#B45309',
  amber300: '#FCD34D',
  amber100: '#FEF3C7',
  amber900: '#78350F',

  slate50: '#F6F7FB',
  slate100: '#EDEFF5',
  slate300: '#B4B9C8',
  slate500: '#5B6070',
  slate700: '#2A2F40',
  slate800: '#1D2130',
  slate900: '#151823',
  slate950: '#0E1016',
} as const;

// The mic button's gradient (MicGradient in Color.kt).
export const MIC_GRADIENT = `linear-gradient(135deg, ${C.indigo600} 0%, ${C.violet600} 100%)`;
export const TEXT_GRADIENT = `linear-gradient(90deg, ${C.indigo300} 0%, ${C.violet600} 55%, ${C.teal300} 100%)`;

/** Adds an alpha channel (0–1) to a #RRGGBB colour. */
export const alpha = (hex: string, a: number): string => {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${v}`;
};
