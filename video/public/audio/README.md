# Audio placeholders

This folder is where narration and background music go. It is empty on purpose:
the first version of the video is silent and relies on on-screen captions.

| File (suggested name) | What it is | Turn it on in `src/audio.ts` |
|---|---|---|
| `voiceover.mp3` | Narration, 60 s or shorter | `VOICEOVER.file = 'audio/voiceover.mp3'` |
| `music.mp3` | Background music (loops if shorter than 60 s) | `MUSIC.file = 'audio/music.mp3'` |

- MP3, WAV, AAC and M4A all work.
- The narration script and its timing are in `src/captions.ts`. Record each line
  so it fits inside its `from`–`to` window (frames at 30 fps; divide by 30 for seconds).
- When a voiceover is set, the music automatically ducks (gets quieter) while
  each caption line is on screen, then fades out over the last 2 seconds.
- Only use music you have the rights to.
