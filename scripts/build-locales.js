// Assemble per-language chunk JSONs (scripts/loc/<code>.<i>.json) into the locale
// files src/i18n/locales/<code>.ts. Missing keys safely fall back to English.
const fs = require('fs');
const path = require('path');

const loc = path.join(__dirname, 'loc');
const dest = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const CHUNKS = 8;
const LANGS = [
  ['hi', 'Hindi (हिन्दी)'],
  ['mr', 'Marathi (मराठी)'],
  ['gu', 'Gujarati (ગુજરાતી)'],
  ['bn', 'Bengali (বাংলা)'],
  ['ta', 'Tamil (தமிழ்)'],
  ['te', 'Telugu (తెలుగు)'],
  ['kn', 'Kannada (ಕನ್ನಡ)'],
];

const enKeys = new Set(
  [...fs.readFileSync(path.join(dest, 'en.ts'), 'utf8').matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]),
);

for (const [code, label] of LANGS) {
  const merged = {};
  let missingChunks = [];
  for (let c = 0; c < CHUNKS; c++) {
    const f = path.join(loc, `${code}.${c}.json`);
    if (!fs.existsSync(f)) {
      missingChunks.push(c);
      continue;
    }
    try {
      Object.assign(merged, JSON.parse(fs.readFileSync(f, 'utf8')));
    } catch (e) {
      missingChunks.push(`${c}(bad)`);
    }
  }
  // Keep only real keys; drop any hallucinated ones.
  const clean = {};
  for (const k of Object.keys(merged)) if (enKeys.has(k)) clean[k] = merged[k];

  const entries = Object.entries(clean).sort((a, b) => a[0].localeCompare(b[0]));
  let out = `/** ${label} translations. Missing keys fall back to English. */\n`;
  out += `export const ${code}: Record<string, string> = {\n`;
  for (const [k, v] of entries) out += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
  out += `};\n`;
  fs.writeFileSync(path.join(dest, `${code}.ts`), out, 'utf8');
  console.log(`${code}: ${entries.length}/${enKeys.size} keys` + (missingChunks.length ? ` | missing chunks ${missingChunks.join(',')}` : ''));
}
