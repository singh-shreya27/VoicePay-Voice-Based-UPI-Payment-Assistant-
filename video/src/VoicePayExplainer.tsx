import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { AudioLayer } from './components/AudioLayer';
import { Background } from './components/Background';
import { PhoneStage } from './components/PhoneStage';
import { ProgressBar } from './components/ProgressBar';
import { SceneShell } from './components/SceneShell';
import { Subtitles } from './components/Subtitles';
import { FONT } from './fonts';
import { lerp } from './lib/anim';
import { ConfirmScene } from './scenes/ConfirmScene';
import { HomeScene } from './scenes/HomeScene';
import { HookScene } from './scenes/HookScene';
import { IntroScene } from './scenes/IntroScene';
import { OutroScene } from './scenes/OutroScene';
import { PayScene } from './scenes/PayScene';
import { ResultScene } from './scenes/ResultScene';
import { SpeakScene } from './scenes/SpeakScene';
import { UnderstandScene } from './scenes/UnderstandScene';
import { C } from './theme';
import { SceneId, SCENES, TRANSITION } from './timeline';

export type ExplainerProps = {
  /** Show the narration subtitles (lower third). */
  showSubtitles: boolean;
};

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  intro: IntroScene,
  home: HomeScene,
  speak: SpeakScene,
  understand: UnderstandScene,
  confirm: ConfirmScene,
  pay: PayScene,
  result: ResultScene,
  outro: OutroScene,
};

/** Fade from and to the background colour at the very start and end. */
const EdgeFade: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = Math.max(lerp(f, [0, 10], [1, 0]), lerp(f, [durationInFrames - 18, durationInFrames - 1], [0, 1]));
  return op > 0 ? <AbsoluteFill style={{ background: C.slate950, opacity: op }} /> : null;
};

export const VoicePayExplainer: React.FC<ExplainerProps> = ({ showSubtitles }) => (
  <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: C.slate950 }}>
    <Background />

    {SCENES.map((scene, i) => {
      const Scene = SCENE_COMPONENTS[scene.id];
      const isLast = i === SCENES.length - 1;
      // Each scene overlaps the next by TRANSITION frames for a cross-fade.
      const length = scene.duration + (isLast ? 0 : TRANSITION);
      return (
        <Sequence key={scene.id} name={scene.id} from={scene.start} durationInFrames={length}>
          <SceneShell length={length} fadeIn={i > 0} fadeOut={!isLast}>
            <Scene />
          </SceneShell>
        </Sequence>
      );
    })}

    <PhoneStage />
    {showSubtitles && <Subtitles />}
    <ProgressBar />
    <EdgeFade />
    <AudioLayer />
  </AbsoluteFill>
);
