import React from 'react';
import { FeatureRow } from '../components/Cards';
import { Kicker, LeftColumn, RevealText, SubText } from '../components/SceneTitle';
import { C } from '../theme';

// 5-result.jpg is shown after the user answers "Yes, I paid". VoicePay cannot
// see inside the UPI app, so the copy presents this as the user's confirmation,
// not as a verified transaction.
export const ResultScene: React.FC = () => (
  <LeftColumn>
    <Kicker text="Done" delay={4} color={C.teal300} />
    <RevealText text="Paid, in *one* *sentence.*" delay={8} size={88} />
    <SubText delay={30}>This screen appears after you tap “Yes, I paid”, once you’ve paid in your UPI app.</SubText>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
      <FeatureRow icon="lock" text="Your PIN stays in your UPI app" delay={52} color={C.teal300} />
    </div>
  </LeftColumn>
);
