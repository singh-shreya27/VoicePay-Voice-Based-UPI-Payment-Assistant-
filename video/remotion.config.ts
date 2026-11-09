// Remotion CLI configuration. Applies to `remotion studio`, `remotion render` and `remotion still`.
import { Config } from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18); // high quality, ~visually lossless
Config.setPixelFormat('yuv420p'); // plays everywhere (QuickTime, WhatsApp, browsers)
Config.setOverwriteOutput(true);
