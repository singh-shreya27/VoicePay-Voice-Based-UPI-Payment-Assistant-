import React from 'react';
import { Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_IN, lerp, pop } from '../lib/anim';
import { sceneEnd, sceneStart, TRANSITION } from '../timeline';
import { PhoneFrame, phoneSize } from './PhoneFrame';
import { ConfirmOverlay, HomeOverlay, PayOverlay, ResultOverlay, SpeakOverlay } from './PhoneOverlays';

// One persistent phone, independent of the scene cross-fades, so the device
// never flickers between scenes: only the screenshot inside it changes.

export const PHONE = { x: 1180, y: 62, height: 846 };

type Segment = { from: number; to: number; src: string; Overlay: React.FC };
type Run = { enter: number; exitStart: number; exitEnd: number; segments: Segment[] };

const EXIT = 34;

const RUNS: Run[] = [
  {
    enter: sceneStart('home'),
    exitStart: sceneEnd('speak') - 20,
    exitEnd: sceneEnd('speak') - 20 + EXIT,
    segments: [
      { from: sceneStart('home'), to: sceneEnd('home'), src: 'screenshots/1-home.jpg', Overlay: HomeOverlay },
      { from: sceneStart('speak'), to: sceneEnd('speak') + TRANSITION, src: 'screenshots/2-listening.jpg', Overlay: SpeakOverlay },
    ],
  },
  {
    enter: sceneStart('confirm'),
    exitStart: sceneEnd('result') - 10,
    exitEnd: sceneEnd('result') - 10 + EXIT,
    segments: [
      { from: sceneStart('confirm'), to: sceneEnd('confirm'), src: 'screenshots/3-confirm.jpg', Overlay: ConfirmOverlay },
      { from: sceneStart('pay'), to: sceneEnd('pay'), src: 'screenshots/4-pay-in-upi-app.jpg', Overlay: PayOverlay },
      { from: sceneStart('result'), to: sceneEnd('result') + EXIT, src: 'screenshots/5-result.jpg', Overlay: ResultOverlay },
    ],
  },
];

/** Screen cross-fade length when one screenshot replaces another. */
const SWAP = 12;

const PhoneRun: React.FC<{ run: Run }> = ({ run }) => {
  const f = useCurrentFrame(); // absolute frame
  const { fps } = useVideoConfig();
  const enter = pop(f, fps, run.enter, { damping: 19, stiffness: 70, mass: 1 });
  const exit = lerp(f, [run.exitStart, run.exitEnd], [0, 1], EASE_IN);

  const floatY = Math.sin(f / 42) * 9;
  const floatRot = Math.sin(f / 67) * 1.6;
  const rotY = -11 + floatRot + (1 - enter) * -38 + exit * 30;
  const rotX = 3 + Math.cos(f / 55) * 1;
  const tx = (1 - enter) * 420 + exit * 520;
  const opacity = Math.min(lerp(enter, [0, 0.35], [0, 1]), 1 - exit);
  const { width, height } = phoneSize(PHONE.height);

  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE.x,
        top: PHONE.y,
        width,
        height,
        perspective: 2400,
        opacity,
      }}
    >
      {/* Floor glow / reflection */}
      <div
        style={{
          position: 'absolute',
          left: -80,
          right: -80,
          bottom: -70,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(124,58,237,0.45), transparent)',
          filter: 'blur(10px)',
          transform: `translateX(${tx * 0.6}px) scaleX(${1 - floatY / 120})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${tx}px) translateY(${floatY}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <PhoneFrame
          height={PHONE.height}
          screen={run.segments.map((seg, i) => {
            if (f < seg.from || f >= seg.to + SWAP) return null;
            const op = i === 0 ? 1 : lerp(f, [seg.from, seg.from + SWAP], [0, 1]);
            return (
              <Img
                key={seg.src}
                src={staticFile(seg.src)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: op,
                }}
              />
            );
          })}
          overlay={run.segments.map((seg) => (
            <Sequence key={seg.src} from={seg.from} durationInFrames={seg.to - seg.from} layout="none">
              <seg.Overlay />
            </Sequence>
          ))}
        />
      </div>
    </div>
  );
};

export const PhoneStage: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {RUNS.map((run, i) =>
        f >= run.enter - 1 && f <= run.exitEnd ? <PhoneRun key={i} run={run} /> : null,
      )}
    </>
  );
};
