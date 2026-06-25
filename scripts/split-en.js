// Split scripts/en.json into chunk files scripts/loc/en.<i>.json (~CHUNK keys each)
// so translation agents handle a small slice per response.
const fs = require('fs');
const path = require('path');

const CHUNK = 110;
const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'en.json'), 'utf8'));
const entries = Object.entries(en);
const dir = path.join(__dirname, 'loc');
fs.mkdirSync(dir, { recursive: true });

let n = 0;
for (let i = 0; i < entries.length; i += CHUNK) {
  const slice = Object.fromEntries(entries.slice(i, i + CHUNK));
  fs.writeFileSync(path.join(dir, `en.${n}.json`), JSON.stringify(slice, null, 2), 'utf8');
  n++;
}
console.log('chunks:', n, '| total keys:', entries.length);
