import fs from 'node:fs';
import path from 'node:path';
import { configureFonts } from '../src/core/fonts.js';
export function setupFonts() {
  configureFonts({ base: path.resolve('public/fonts') + '/', fetchFn: async (u) => new Uint8Array(fs.readFileSync(u)).buffer });
}
