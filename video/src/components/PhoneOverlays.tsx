import React from 'react';
import { C } from '../theme';
import { Burst, Callout, Highlight, PulseRings, Spotlight, TapRipple } from './ScreenFx';

// Animated layers drawn on top of each real screenshot. Frames are local to the
// screenshot's segment (0 = when that screenshot appears). Coordinates are in
// screenshot pixels (720×1600), measured from docs/screenshots/*.jpg.

/** 1-home.jpg */
export const HomeOverlay: React.FC = () => (
  <>
    <PulseRings cx={360} cy={475} r={185} start={18} end={192} color={C.violet600} />
    <Callout x={505} y={475} start={40} end={176} title="One big button" sub="Tap and speak" icon="mic" />
    <Callout x={655} y={888} start={72} end={176} title="Your language" sub="हिन्दी · Hindi" icon="translate" />
    <Callout x={655} y={1160} start={104} end={176} title="Your contacts" sub="Saved on your phone" icon="people" color={C.teal300} />
    <TapRipple x={360} y={475} at={206} />
  </>
);

/** 2-listening.jpg */
export const SpeakOverlay: React.FC = () => (
  <>
    <PulseRings cx={360} cy={475} r={210} start={0} end={226} color={C.indigo300} count={4} period={40} spread={0.7} />
    <Callout x={612} y={718} start={36} end={200} title="Listening…" sub="Tap again when done" icon="mic" />
    <TapRipple x={360} y={475} at={232} />
  </>
);

/** 3-confirm.jpg. Synced to narration: "…read back aloud" ≈ frames 9–62, "…tap Confirm" ends ≈ 147. */
export const CONFIRM_TIMES = { name: 8, amount: 30, hear: 52, confirm: 100, tap: 142 } as const;

export const ConfirmOverlay: React.FC = () => {
  const t = CONFIRM_TIMES;
  return (
    <>
      <Spotlight x={205} y={610} w={310} h={128} start={t.name} end={t.amount - 4} />
      <Highlight x={205} y={610} w={310} h={128} start={t.name} end={t.amount - 4} />

      <Spotlight x={290} y={778} w={140} h={104} start={t.amount} end={t.hear - 4} />
      <Highlight x={290} y={778} w={140} h={104} start={t.amount} end={t.hear - 4} />

      <Spotlight x={224} y={912} w={272} h={70} r={35} start={t.hear} end={t.confirm - 6} />
      <Highlight x={224} y={912} w={272} h={70} r={35} start={t.hear} end={t.confirm - 6} color={C.teal300} />
      <Callout x={500} y={947} start={t.hear + 4} end={t.confirm - 6} title="Read aloud" sub="In your language" icon="volume" color={C.teal300} />

      <Spotlight x={36} y={1313} w={648} h={111} r={36} start={t.confirm} />
      <Highlight x={36} y={1313} w={648} h={111} r={36} start={t.confirm} />
      <TapRipple x={360} y={1368} at={t.tap} />
    </>
  );
};

/** 4-pay-in-upi-app.jpg */
export const PayOverlay: React.FC = () => (
  <>
    <Spotlight x={52} y={240} w={616} h={66} start={14} end={56} />
    <Highlight x={52} y={240} w={616} h={66} start={14} end={56} />

    <Spotlight x={52} y={322} w={616} h={170} start={60} end={104} />
    <Highlight x={52} y={322} w={616} h={170} start={60} end={104} />
    <Callout x={640} y={460} start={64} end={104} title="UPI ID copied" sub="geetaverma@oksbi" icon="copy" color={C.teal300} />

    <Spotlight x={52} y={522} w={616} h={66} start={108} end={150} />
    <Highlight x={52} y={522} w={616} h={66} start={108} end={150} />
    <Callout x={640} y={552} start={112} end={150} title="Your UPI PIN" sub="Entered in your UPI app" icon="lock" color={C.amber300} />

    <Spotlight x={36} y={800} w={648} h={200} start={156} />
    <Highlight x={36} y={887} w={648} h={111} r={36} start={162} />
    <TapRipple x={360} y={942} at={206} />
  </>
);

/** 5-result.jpg */
export const ResultOverlay: React.FC = () => (
  <>
    <PulseRings cx={360} cy={685} r={131} start={4} color={C.teal300} period={42} spread={1.1} />
    <Burst cx={360} cy={685} at={8} />
    <Callout
      x={600}
      y={928}
      start={44}
      end={134}
      title="Your confirmation"
      sub="After “Yes, I paid”"
      icon="check"
      color={C.teal300}
    />
  </>
);
