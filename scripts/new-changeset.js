#!/usr/bin/env node
/**
 * new-changeset.js — Interactive helper to create a new changeset file.
 */
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const changesDir = join(root, '.changesets');

const rl = createInterface({ input: process.stdin, output: process.stdout });

const ask = (q) => new Promise((res) => rl.question(q, res));

const PACKAGES = [
  '@better-pwa/core',
  '@better-pwa/offline',
  '@better-pwa/storage',
  '@better-pwa/sw-builder',
  '@better-pwa/manifest',
  'better-pwa (CLI)',
  '@better-pwa/adapter-react',
  '@better-pwa/adapter-vue',
  '@better-pwa/adapter-svelte',
  '@better-pwa/adapter-next',
  '@better-pwa/adapter-vite',
];

const BUMP_TYPES = [
  { value: 'patch', label: 'patch — bug fix, no API change' },
  { value: 'minor', label: 'minor — new feature, backward compatible' },
  { value: 'major', label: 'major — breaking change' },
];

async function main() {
  console.log('\n📝 New Changeset\n');

  console.log('What changed?');
  BUMP_TYPES.forEach((t, i) => console.log(`  [${i + 1}] ${t.label}`));
  const bumpIdx = parseInt(await ask('Type a number: '), 10) - 1;
  const bump = BUMP_TYPES[bumpIdx]?.value ?? 'patch';

  console.log('\nAffected packages (comma-separated, or ENTER for all):');
  PACKAGES.forEach((p, i) => console.log(`  [${i + 1}] ${p}`));
  const pkgInput = await ask('Select: ');
  let selectedPkgs = PACKAGES;
  if (pkgInput.trim()) {
    const indices = pkgInput.split(',').map((s) => parseInt(s.trim(), 10) - 1);
    selectedPkgs = indices.map((i) => PACKAGES[i]).filter(Boolean);
  }

  const summary = await ask('Summary: ');

  const frontmatter = selectedPkgs
    .map((pkg) => `"${pkg}": ${bump}`)
    .join('\n');

  const slug = summary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const filename = `${slug}.md`;
  const filepath = join(changesDir, filename);

  const content = `---
${frontmatter}
---

${summary}
`;

  if (!existsSync(changesDir)) {
    const { mkdirSync } = await import('node:fs');
    mkdirSync(changesDir, { recursive: true });
  }

  writeFileSync(filepath, content);
  console.log(`\n✅ File: .changesets/${filename}`);
  rl.close();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  rl.close();
  process.exit(1);
});
