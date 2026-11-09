import React, { createContext, useContext } from 'react';
import { alpha, C } from '../theme';

/** Native size of the screenshots in docs/screenshots (all are 720×1600). */
export const SHOT_W = 720;
export const SHOT_H = 1600;

export const BEZEL = 13;

/** Converts screenshot pixels to on-screen pixels for overlays drawn on the phone. */
const ScreenScaleContext = createContext(1);
export const useScreenScale = () => useContext(ScreenScaleContext);

export const phoneSize = (height: number) => {
  const screenH = height - BEZEL * 2;
  const screenW = (screenH * SHOT_W) / SHOT_H; // exact screenshot aspect ratio: no distortion
  return { width: screenW + BEZEL * 2, height, screenW, screenH, scale: screenW / SHOT_W };
};

/**
 * A static smartphone body. The screen area has exactly the screenshot's 9:20
 * aspect ratio, so screenshots are shown 1:1 without stretching or cropping
 * (apart from the rounded display corners).
 *
 * - `screen`: layers drawn inside the display (clipped)
 * - `overlay`: layers drawn on top, in screenshot coordinates, not clipped
 */
export const PhoneFrame: React.FC<{
  height: number;
  screen: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ height, screen, overlay }) => {
  const { width, screenW, screenH, scale } = phoneSize(height);
  const radius = 62;
  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Side buttons */}
      <div style={{ position: 'absolute', right: -4, top: height * 0.2, width: 5, height: 70, borderRadius: 3, background: '#3b4052' }} />
      <div style={{ position: 'absolute', right: -4, top: height * 0.31, width: 5, height: 110, borderRadius: 3, background: '#3b4052' }} />

      {/* Body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: 'linear-gradient(150deg, #4a4f63 0%, #1b1e29 22%, #10121a 60%, #353a4c 100%)',
          boxShadow: [
            'inset 0 0 0 1.5px rgba(255,255,255,0.14)',
            'inset 0 0 0 5px #0b0c11',
            '0 50px 100px rgba(0,0,0,0.55)',
            `0 0 90px ${alpha(C.indigo600, 0.35)}`,
          ].join(', '),
        }}
      />

      {/* Display */}
      <div
        style={{
          position: 'absolute',
          left: BEZEL,
          top: BEZEL,
          width: screenW,
          height: screenH,
          borderRadius: radius - BEZEL,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {screen}
        {/* Glass reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, transparent 42%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Overlay layer, same box as the display but not clipped */}
      <div style={{ position: 'absolute', left: BEZEL, top: BEZEL, width: screenW, height: screenH }}>
        <ScreenScaleContext.Provider value={scale}>{overlay}</ScreenScaleContext.Provider>
      </div>
    </div>
  );
};
