import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadDevanagari } from '@remotion/google-fonts/NotoSansDevanagari';
import { loadFont as loadTamil } from '@remotion/google-fonts/NotoSansTamil';
import { loadFont as loadBengali } from '@remotion/google-fonts/NotoSansBengali';
import { loadFont as loadTelugu } from '@remotion/google-fonts/NotoSansTelugu';
import { loadFont as loadKannada } from '@remotion/google-fonts/NotoSansKannada';
import { loadFont as loadMalayalam } from '@remotion/google-fonts/NotoSansMalayalam';
import { loadFont as loadGujarati } from '@remotion/google-fonts/NotoSansGujarati';
import { loadFont as loadGurmukhi } from '@remotion/google-fonts/NotoSansGurmukhi';

// Fonts are loaded through Remotion's font loader, which blocks rendering until
// they are ready. That keeps every frame identical between preview and render.
const inter = loadInter('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

// Indian scripts, used for the language chips and the Hindi label.
const indic = [
  loadDevanagari('normal', { weights: ['600'], subsets: ['devanagari'] }),
  loadTamil('normal', { weights: ['600'], subsets: ['tamil'] }),
  loadBengali('normal', { weights: ['600'], subsets: ['bengali'] }),
  loadTelugu('normal', { weights: ['600'], subsets: ['telugu'] }),
  loadKannada('normal', { weights: ['600'], subsets: ['kannada'] }),
  loadMalayalam('normal', { weights: ['600'], subsets: ['malayalam'] }),
  loadGujarati('normal', { weights: ['600'], subsets: ['gujarati'] }),
  loadGurmukhi('normal', { weights: ['600'], subsets: ['gurmukhi'] }),
];

export const FONT = [inter.fontFamily, ...indic.map((f) => f.fontFamily), 'sans-serif'].join(', ');
export const MONO = '"Cascadia Mono", "Consolas", "SFMono-Regular", monospace';
