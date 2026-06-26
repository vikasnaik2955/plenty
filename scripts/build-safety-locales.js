// Merge the agent-written safety/legal translations into each locale .ts (idempotent).
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'loc', 'safety-locales.json'), 'utf8'));
const enKeys = new Set(
  [...fs.readFileSync(path.join(dir, 'en.ts'), 'utf8').matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]),
);

for (const [code, map] of Object.entries(data)) {
  const f = path.join(dir, `${code}.ts`);
  if (!fs.existsSync(f)) continue;
  let src = fs.readFileSync(f, 'utf8');
  if (src.includes('"legal.title"')) {
    console.log(`${code}: already present, skipped`);
    continue;
  }
  const lines =
    Object.entries(map)
      .filter(([k]) => enKeys.has(k))
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
      .join('\n') + '\n';
  src = src.replace(/(= \{\n)/, `$1${lines}`);
  fs.writeFileSync(f, src, 'utf8');
  console.log(`${code}: added`);
}
