// Completeness check: every literal t('key') / tr('key') used in src must exist
// in en.ts. (Dynamic template-literal keys are skipped — verify those by eye.)
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const enText = fs.readFileSync(path.join(SRC, 'i18n', 'locales', 'en.ts'), 'utf8');
const enKeys = new Set([...enText.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]));

const used = new Set();
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !p.includes(path.join('i18n', 'locales'))) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const m of txt.matchAll(/\b(?:t|tr)\(\s*'([^']+)'/g)) used.add(m[1]);
    }
  }
}
walk(SRC);

const missing = [...used].filter((k) => !enKeys.has(k)).sort();
console.log('en keys:', enKeys.size, '| literal keys used:', used.size, '| missing:', missing.length);
if (missing.length) {
  console.log('MISSING:');
  for (const k of missing) console.log('  ' + k);
  process.exit(1);
}
console.log('OK — all literal keys present.');
