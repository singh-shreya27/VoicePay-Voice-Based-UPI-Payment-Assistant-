import React from 'react';
import { FeatureRow } from '../components/Cards';
import { Kicker, LeftColumn, RevealText, SubText } from '../components/SceneTitle';
import { C } from '../theme';

// Phone with 1-home.jpg is drawn by PhoneStage; this scene is the text column.
export const HomeScene: React.FC = () => (
  <LeftColumn>
    <Kicker text="Step 1 · Tap" delay={8} />
    <RevealText text="One big button. *That’s* *it.*" delay={14} size={84} />
    <SubText delay={40}>No menus, no typing. Choose your language once and save the people you pay.</SubText>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6 }}>
      <FeatureRow icon="mic" text="Large, clear mic button" delay={60} />
      <FeatureRow icon="translate" text="Your language: हिन्दी and 9 more" delay={84} />
      <FeatureRow icon="people" text="Contacts stay on your phone" delay={108} color={C.teal300} />
    </div>
  </LeftColumn>
);
