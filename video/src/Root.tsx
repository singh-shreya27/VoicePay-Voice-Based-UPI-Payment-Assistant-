import React from 'react';
import { Composition } from 'remotion';
import { ExplainerProps, VoicePayExplainer } from './VoicePayExplainer';
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './timeline';

const defaultProps: ExplainerProps = { showSubtitles: true };

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VoicePayExplainer"
    component={VoicePayExplainer}
    durationInFrames={TOTAL_FRAMES} // 1800 = 60 s at 30 fps
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={defaultProps}
  />
);
