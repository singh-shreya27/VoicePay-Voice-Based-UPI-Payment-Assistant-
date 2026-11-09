import React from 'react';
import { StepList } from '../components/Cards';
import { CONFIRM_TIMES as T } from '../components/PhoneOverlays';
import { Kicker, LeftColumn, RevealText } from '../components/SceneTitle';

// Item timings are shared with the spotlights in PhoneOverlays → ConfirmOverlay.
export const ConfirmScene: React.FC = () => (
  <LeftColumn>
    <Kicker text="Step 3 · Confirm" delay={4} />
    <RevealText text="Hear it. See it. *Then* *confirm.*" delay={8} size={80} />
    <div style={{ marginTop: 8 }}>
      <StepList
        items={[
          { at: T.name, text: 'Name and UPI ID from your saved contacts' },
          { at: T.amount, text: 'The amount, big and clear: ₹2' },
          { at: T.hear, text: 'Read aloud in your language' },
          { at: T.confirm, text: 'Nothing happens until you tap Confirm' },
        ]}
      />
    </div>
  </LeftColumn>
);
