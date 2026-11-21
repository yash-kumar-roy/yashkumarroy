// Copies the built-in demo apps into dist/demos/<slug>/ after `vite build`, so static hosts
// (Vercel, Netlify, …) serve them without the Express server. Server-side files are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoMappings, isPrivateDemoFile } from '../server/data/demos.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist', 'demos');

if (!fs.existsSync(path.join(root, 'dist'))) {
  console.error('dist/ not found. Run `vite build` first.');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
for (const { slug, folder } of demoMappings) {
  const from = path.join(root, folder);
  if (!fs.existsSync(from)) {
    console.warn(`  skipped ${slug}: folder "${folder}" not found`);
    continue;
  }
  fs.cpSync(from, path.join(outDir, slug), {
    recursive: true,
    filter: (src) => !isPrivateDemoFile(path.relative(from, src))
  });
}
console.log(`Copied ${demoMappings.length} demos to dist/demos/`);
