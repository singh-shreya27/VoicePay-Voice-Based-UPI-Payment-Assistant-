# VoicePay explainer video

A 60-second animated product explainer for VoicePay, built with [Remotion](https://www.remotion.dev/) (React + TypeScript).
It uses the app's real screenshots from `docs/screenshots/` and the brand colours from the Android app's `Color.kt`.

| | |
|---|---|
| Format | 1920 × 1080 (16:9), 30 fps |
| Length | 1800 frames = 60 s |
| Composition ID | `VoicePayExplainer` |
| Audio | Voiceover (`public/audio/voiceover.wav`). Background-music slot ready but empty (see [Audio](#audio)) |

## Requirements

- Node.js 18 or later (tested with Node 24) and npm.
- Internet access the first time you render. Remotion downloads its own headless Chrome, and the fonts (Inter plus Noto Sans for Indian scripts) load from Google Fonts. ffmpeg is bundled with Remotion, so you don't need to install it.

## Setup

```bash
cd video
npm install
```

> The repository is inside OneDrive. `node_modules` (several hundred MB) and `out/` are git-ignored, but OneDrive will still try to sync them. You can pause OneDrive while installing, or exclude these folders.

## Preview

```bash
npm run studio
```

This opens Remotion Studio in your browser (usually http://localhost:3000). Pick **VoicePayExplainer** and press space to play. You can scrub the timeline. Each scene shows up as a named sequence, and edits reload live.

## Render

```bash
npm run render                 # → out/voicepay-explainer.mp4  (H.264, CRF 18)
npm run render:no-subtitles    # → out/voicepay-explainer-clean.mp4 (no narration subtitles)
npm run still                  # → out/poster.png (end card, frame 1720)
npm run typecheck              # TypeScript check
```

Rendering 1800 frames takes a few minutes, depending on your machine.

## Storyboard

| Time | Frames | Scene | What's on screen |
|---|---|---|---|
| 0:00–0:06 | 0–179 | Hook | "UPI is everywhere. But paying can still feel hard." Four pain-point cards from the README |
| 0:06–0:10 | 180–299 | Intro | Logo reveal with shockwave rings, "Pay anyone, just by saying it." |
| 0:10–0:18 | 300–539 | Home | Phone enters with `1-home.jpg`, mic pulse rings, callouts, tap ripple |
| 0:18–0:27 | 540–809 | Speak | `2-listening.jpg`, typed speech bubble *"Geeta ko 2 rupaye bhej do"*, live waveform, 10 language chips |
| 0:27–0:34 | 810–1019 | Understand | Pipeline: voice → speech-to-text → AI `{payee, amount}` → matched to a saved contact |
| 0:34–0:42 | 1020–1259 | Confirm | `3-confirm.jpg` with spotlights on name/UPI ID, amount, Hear again, Confirm |
| 0:42–0:50 | 1260–1499 | Pay | `4-pay-in-upi-app.jpg`, each step spotlighted, "UPI ID copied", tap on "Yes, I paid" |
| 0:50–0:55 | 1500–1649 | Result | `5-result.jpg` with a teal burst. Presented as the user's own confirmation |
| 0:55–1:00 | 1650–1799 | Outro | End card with the safety pills, fade out |

Scenes cross-fade over 16 frames. Timings live in `src/timeline.ts`.

**Accuracy notes**
- The spoken example matches the recorded payment (₹2 to Geeta).
- The result screen is described as the user's confirmation ("Yes, I paid"). VoicePay can't see what happens inside the UPI app, so the video never claims the payment was verified.
- Screenshots are shown 1:1. The phone's display area has exactly their 720×1600 aspect ratio, so nothing is stretched or redrawn. Highlights are separate layers drawn on top.

## Project structure

```
video/
├── public/
│   ├── screenshots/          copies of docs/screenshots (originals untouched)
│   └── audio/                drop narration / music here (see README inside)
├── src/
│   ├── index.ts              registerRoot
│   ├── Root.tsx              <Composition> 1920×1080, 30 fps, 1800 frames
│   ├── VoicePayExplainer.tsx scene sequencing, layers, subtitles, audio
│   ├── timeline.ts           scene order and lengths (single source of truth)
│   ├── captions.ts           narration script + subtitle timing
│   ├── audio.ts              voiceover / music placeholders
│   ├── theme.ts              brand colours from Color.kt
│   ├── fonts.ts              Inter + Noto Sans (Indian scripts) via @remotion/google-fonts
│   ├── lib/anim.ts           easing, clamped interpolate, spring helpers
│   ├── components/
│   │   ├── PhoneFrame.tsx    smartphone mockup (screenshot shown 1:1)
│   │   ├── PhoneStage.tsx    one persistent phone across scenes, screen swaps, enter/exit
│   │   ├── PhoneOverlays.tsx per-screenshot animations (coordinates in screenshot pixels)
│   │   ├── ScreenFx.tsx      Spotlight, Highlight, PulseRings, TapRipple, Callout, Burst
│   │   ├── Waveform.tsx      deterministic animated voice waveform
│   │   ├── SpeechBubble.tsx  typewriter speech bubble
│   │   ├── Background.tsx    drifting glows, grid, particles
│   │   └── …                 titles, cards, logo, subtitles, progress bar, audio layer
│   └── scenes/               one file per scene
└── remotion.config.ts        codec/quality settings
```

All animation is driven by `useCurrentFrame()` with `interpolate`/`spring`, and any randomness uses Remotion's seeded `random()`. There's no `Math.random()`, timers or CSS animations, so every render is frame-identical.

## Audio

### Voiceover

The narration is `public/audio/voiceover.wav` (60.4 s, mono, 44.1 kHz). It's configured in `src/audio.ts` as nine clips, one per line. Each clip is a slice of the recording, cut in a silent gap, and can be moved with `shift` (in seconds) so the line lands on its scene. The recording itself is never edited.

| Line | Heard in video | Shift | Text |
|---|---|---|---|
| 1 | 0:00.0–0:05.5 | 0 | UPI is everywhere. But for many elders, paying still feels hard. |
| 2 | 0:06.3–0:09.8 | 0 | Meet VoicePay. Pay anyone, just by saying it. |
| 3 | 0:10.4–0:14.6 | 0 | Tap one big button. Your language and contacts are right there. |
| 4 | 0:17.9–0:23.5 | +1.35 s | Just say it: "Geeta ko 2 rupaye bhej do." In any of 10 Indian languages. |
| 5 | 0:27.4–0:32.0 | +1.6 s | VoicePay works out who and how much, then finds them in your saved contacts. |
| 6 | 0:34.3–0:38.9 | +0.6 s | It reads the payment back aloud. Nothing happens until you tap Confirm. |
| 7 | 0:42.3–0:47.1 | +0.6 s | It copies the UPI ID and guides you to pay in your own UPI app. |
| 8 | 0:50.2–0:53.8 | +0.3 s | Back in VoicePay, tap "Yes, I paid", and you're done. |
| 9 | 0:54.5–0:59.9 | −0.25 s | VoicePay. Speak, confirm, pay. Safely, in your language. |

The subtitles in `src/captions.ts` are timed to these "heard" windows. The typed speech bubble and language chips (Speak scene) and the spotlights (Confirm scene) are synced to the spoken words.

**If you re-record:** replace `voiceover.wav`, then adjust each clip's `from`/`to` (cut points in the recording) and `shift`. To play a file exactly as recorded, with no splitting, set `clips: []`.

### Background music

1. Put a track in `public/audio/`, for example `music.mp3`.
2. In `src/audio.ts`, set `MUSIC.file = 'audio/music.mp3'`.

The music fades in, ducks to `duckedVolume` while each narration line plays, and fades out over the last 2 s. While `file` is `null`, no audio element is created.

## Common edits

- **Change wording:** scene text is in `src/scenes/*.tsx`, and subtitles are in `src/captions.ts`.
- **Change timing:** edit the lengths in `src/timeline.ts`. Phone overlays use frames local to each screenshot, in `src/components/PhoneOverlays.tsx`.
- **Hide subtitles:** set `showSubtitles` to `false` in the Studio's props panel, or use `npm run render:no-subtitles`.
- **Move a highlight:** coordinates in `PhoneOverlays.tsx` are in screenshot pixels (720×1600). Open the JPG in any image viewer to measure them.
