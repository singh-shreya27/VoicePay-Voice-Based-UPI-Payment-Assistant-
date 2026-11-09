// Single source of truth for timing. 30 fps × 60 s = 1800 frames.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Frames each scene overlaps the next one, for a cross-fade. */
export const TRANSITION = 16;

export type SceneId =
  | 'hook'
  | 'intro'
  | 'home'
  | 'speak'
  | 'understand'
  | 'confirm'
  | 'pay'
  | 'result'
  | 'outro';

const ORDER: Array<[SceneId, number]> = [
  ['hook', 180], //       0:00 – 0:06  The problem
  ['intro', 120], //      0:06 – 0:10  Logo + tagline
  ['home', 240], //       0:10 – 0:18  Screenshot 1
  ['speak', 270], //      0:18 – 0:27  Screenshot 2
  ['understand', 210], // 0:27 – 0:34  Pipeline
  ['confirm', 240], //    0:34 – 0:42  Screenshot 3
  ['pay', 240], //        0:42 – 0:50  Screenshot 4
  ['result', 150], //     0:50 – 0:55  Screenshot 5
  ['outro', 150], //      0:55 – 1:00  Safety + end card
];

export type SceneSlot = { id: SceneId; start: number; duration: number };

export const SCENES: SceneSlot[] = (() => {
  let t = 0;
  return ORDER.map(([id, duration]) => {
    const slot = { id, start: t, duration };
    t += duration;
    return slot;
  });
})();

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const sceneStart = (id: SceneId): number => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s.start;
};

export const sceneEnd = (id: SceneId): number => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s.start + s.duration;
};
