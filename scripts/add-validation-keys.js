// Insert the two validation.* keys into each locale file (idempotent).
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

const T = {
  hi: ['आवश्यक जानकारी अधूरी', 'जारी रखने से पहले कृपया ये भरें:\n{fields}'],
  mr: ['आवश्यक माहिती अपूर्ण', 'पुढे जाण्यापूर्वी कृपया हे भरा:\n{fields}'],
  gu: ['જરૂરી વિગતો અધૂરી', 'આગળ વધતા પહેલાં કૃપા કરીને આ ભરો:\n{fields}'],
  bn: ['প্রয়োজনীয় তথ্য অসম্পূর্ণ', 'এগিয়ে যাওয়ার আগে অনুগ্রহ করে এগুলি পূরণ করুন:\n{fields}'],
  ta: ['தேவையான விவரங்கள் நிரப்பப்படவில்லை', 'தொடர்வதற்கு முன் தயவுசெய்து இவற்றை நிரப்பவும்:\n{fields}'],
  te: ['అవసరమైన వివరాలు అసంపూర్ణం', 'కొనసాగడానికి ముందు దయచేసి వీటిని పూరించండి:\n{fields}'],
  kn: ['ಅಗತ್ಯ ವಿವರಗಳು ಅಪೂರ್ಣ', 'ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಇವುಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ:\n{fields}'],
};

for (const [code, [title, msg]] of Object.entries(T)) {
  const f = path.join(dir, `${code}.ts`);
  let src = fs.readFileSync(f, 'utf8');
  if (src.includes('"validation.title"')) {
    console.log(`${code}: already present, skipped`);
    continue;
  }
  const ins = `  "validation.title": ${JSON.stringify(title)},\n  "validation.message": ${JSON.stringify(msg)},\n`;
  src = src.replace(/(= \{\n)/, `$1${ins}`);
  fs.writeFileSync(f, src, 'utf8');
  console.log(`${code}: added`);
}
