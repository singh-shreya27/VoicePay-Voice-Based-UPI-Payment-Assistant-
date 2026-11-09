import React from 'react';
import { StepList } from '../components/Cards';
import { Kicker, LeftColumn, RevealText, SubText } from '../components/SceneTitle';

// Item timings match the spotlights in PhoneOverlays → PayOverlay.
export const PayScene: React.FC = () => (
  <LeftColumn>
    <Kicker text="Step 4 · Pay" delay={4} />
    <RevealText text="Pay in *your* *own* UPI app." delay={8} size={80} />
    <SubText delay={24} size={29}>
      VoicePay never moves money. It copies the UPI ID and talks you through each step.
    </SubText>
    <StepList
      numbered
      items={[
        { at: 14, text: 'Tap “Pay to UPI ID”' },
        { at: 60, text: 'Paste the UPI ID, already copied' },
        { at: 108, text: 'Type ₹2 and enter your own UPI PIN' },
        { at: 156, text: 'Come back and tap “Yes, I paid”' },
      ]}
    />
  </LeftColumn>
);
