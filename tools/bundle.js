#!/usr/bin/env node
// Writes dist/stylesheets.css: index.css with its @import chain inlined,
// each file once, in import order. Remote imports (a CDN) are kept as
// @import rules at the top, where CSS requires them. No dependencies.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const importRule = /@import\s+url\(\s*['"]?([^'")]+)['"]?\s*\)\s*;?/g;
const seen = new Set();
const remote = [];

function inline(file) {
  if (seen.has(file)) return '';
  seen.add(file);
  const css = readFileSync(file, 'utf8');
  return css.replace(importRule, (_, href) => {
    if (/^[a-z]+:\/\//i.test(href)) {
      if (!remote.includes(href)) remote.push(href);
      return '';
    }
    return inline(join(dirname(file), href));
  }).replace(/^\s+|\s+$/g, '') + `\n/* end ${relative(root, file)} */\n`;
}

const body = inline(join(root, 'index.css'));
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const out = [
  `/* @lsongdev/stylesheets ${version} — bundled from index.css */`,
  ...remote.map(href => `@import url(${href});`),
  body,
].join('\n');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'stylesheets.css'), out);
console.log(`dist/stylesheets.css: ${seen.size} files, ${out.length} bytes`);
