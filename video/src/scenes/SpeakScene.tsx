import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Kicker, LeftColumn, RevealText } from '../components/SceneTitle';
import { SpeechBubble } from '../components/SpeechBubble';
import { Waveform } from '../components/Waveform';
import { alpha, C } from '../theme';
import { lerp, pop } from '../lib/anim';

// The 10 languages supported by the app (README → Languages), in their own scripts.
const LANGS = ['हिन्दी', 'English', 'தமிழ்', 'বাংলা', 'తెలుగు', 'ಕನ್ನಡ', 'മലയാളം', 'मराठी', 'ગુજરાતી', 'ਪੰਜਾਬੀ'];

const TYPE_FROM = 33; // synced to the voiceover: sentence heard at local frames 33–87
const TYPE_TO = 87;

/** Loudness: rises while the sentence is spoken, with syllable-like bumps. */
const level = (f: number) => {
  const speaking = Math.min(lerp(f, [TYPE_FROM - 8, TYPE_FROM + 4], [0, 1]), lerp(f, [TYPE_TO + 10, TYPE_TO + 34], [1, 0]));
  const syllables = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.32));
  return 0.1 + 0.9 * speaking * syllables;
};

export const SpeakScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wave = pop(f, fps, 14, { damping: 20 });
  const label = pop(f, fps, 96, { damping: 20 }); // "In any of 10 Indian languages" ≈ frame 99
  const highlight = f >= 106 ? Math.floor((f - 106) / 7) % LANGS.length : 0;

  return (
    <LeftColumn>
      <Kicker text="Step 2 · Speak" delay={4} />
      <RevealText text="Just *say* *it.*" delay={8} size={84} />
      <SpeechBubble
        text="Geeta ko 2 rupaye bhej do"
        translation="“Send 2 rupees to Geeta” · Hindi"
        appearAt={22}
        typeFrom={TYPE_FROM}
        typeTo={TYPE_TO}
      />
      <div style={{ opacity: wave, transform: `scaleY(${lerp(wave, [0, 1], [0.2, 1])})` }}>
        <Waveform width={780} height={120} level={level} />
      </div>

      <div style={{ opacity: label, transform: `translateY(${(1 - label) * 20}px)` }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, color: C.indigo300, textTransform: 'uppercase', marginBottom: 14 }}>
          Works in 10 Indian languages
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 820 }}>
          {LANGS.map((l, i) => {
            const p = pop(f, fps, 100 + i * 3, { damping: 14 });
            const on = i === highlight;
            return (
              <div
                key={l}
                style={{
                  padding: '9px 20px',
                  borderRadius: 999,
                  fontSize: 25,
                  fontWeight: 600,
                  color: on ? '#fff' : C.slate300,
                  background: on ? `linear-gradient(135deg, ${C.indigo600}, ${C.violet600})` : alpha(C.slate700, 0.7),
                  border: `1.5px solid ${on ? alpha(C.indigo300, 0.8) : alpha(C.slate500, 0.35)}`,
                  boxShadow: on ? `0 0 22px ${alpha(C.violet600, 0.7)}` : 'none',
                  opacity: p,
                  transform: `scale(${lerp(p, [0, 1], [0.6, 1]) * (on ? 1.06 : 1)})`,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      </div>
    </LeftColumn>
  );
};
