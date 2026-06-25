// Insert the share.button label translation into each locale (idempotent).
// The share captions stay English (fall back), since social captions are
// commonly posted in English for broad reach.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const T = {
  hi: 'अपना योगदान साझा करें',
  mr: 'तुमचा सहभाग शेअर करा',
  gu: 'તમારું યોગદાન શેર કરો',
  bn: 'আপনার অবদান শেয়ার করুন',
  ta: 'உங்கள் பங்களிப்பைப் பகிரவும்',
  te: 'మీ సహకారాన్ని షేర్ చేయండి',
  kn: 'ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
};

for (const [code, label] of Object.entries(T)) {
  const f = path.join(dir, `${code}.ts`);
  let src = fs.readFileSync(f, 'utf8');
  if (src.includes('"share.button"')) {
    console.log(`${code}: already present, skipped`);
    continue;
  }
  src = src.replace(/(= \{\n)/, `$1  "share.button": ${JSON.stringify(label)},\n`);
  fs.writeFileSync(f, src, 'utf8');
  console.log(`${code}: added`);
}
