// Report how many of the English keys each locale file covers (missing keys
// safely fall back to English at runtime, but we want high coverage).
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const enKeys = new Set(
  [...fs.readFileSync(path.join(dir, 'en.ts'), 'utf8').matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]),
);
const total = enKeys.size;

for (const code of ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn']) {
  const f = path.join(dir, `${code}.ts`);
  if (!fs.existsSync(f)) {
    console.log(`${code}: MISSING FILE`);
    continue;
  }
  const keys = new Set([...fs.readFileSync(f, 'utf8').matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  console.log(`${code}: ${keys.size} keys | covers ${total - missing.length}/${total} | missing ${missing.length} | extra ${extra.length}`);
}
