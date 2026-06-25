// One-off: rebuild src/i18n/locales/en.ts from the i18n extraction workflow's
// returned key map + the central keys, as one clean object (no duplicates).
const fs = require('fs');
const path = require('path');

// All args are workflow .output files; merge every result.keys map.
const outFiles = process.argv.slice(2);
function keysFrom(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    data = JSON.parse(raw.slice(start, end + 1));
  }
  return (data.result && data.result.keys) || data.keys || {};
}
const wfKeys = {};
for (const f of outFiles) Object.assign(wfKeys, keysFrom(f));

const central = {
  'common.cancel': 'Cancel', 'common.save': 'Save', 'common.done': 'Done', 'common.add': 'Add',
  'common.remove': 'Remove', 'common.edit': 'Edit', 'common.delete': 'Delete', 'common.back': 'Back',
  'common.close': 'Close', 'common.continue': 'Continue', 'common.retry': 'Try again', 'common.seeAll': 'See all',
  'common.optional': 'Optional', 'common.required': 'Required', 'common.send': 'Send', 'common.confirm': 'Confirm',
  'common.message': 'Message', 'common.call': 'Call',
  'status.requested': 'Requested', 'status.accepted': 'Accepted', 'status.picked_up': 'Picked up',
  'status.delivered': 'Delivered', 'status.completed': 'Completed', 'status.cancelled': 'Cancelled',
  'nav.home': 'Home', 'nav.history': 'History', 'nav.donate': 'Donate', 'nav.rewards': 'Rewards',
  'nav.profile': 'Profile', 'nav.requests': 'Requests', 'nav.team': 'Team', 'nav.reports': 'Reports',
  'nav.transport': 'Transport', 'nav.allocations': 'Allocations', 'nav.audit': 'Audit', 'nav.jobs': 'Jobs',
  'nav.vehicle': 'Vehicle',
  'role.donor': 'Donor', 'role.volunteer': 'Volunteer', 'role.transport': 'Transport', 'role.admin': 'Admin',
  'language.title': 'Language', 'language.subtitle': 'Choose your preferred language for the app.',
  'language.setTo': 'Language set to {name}',
};

// Hand-recovered / supplemental keys not returned by the workflow.
let extra = {};
const extraPath = path.join(__dirname, 'extra-keys.json');
if (fs.existsSync(extraPath)) extra = JSON.parse(fs.readFileSync(extraPath, 'utf8'));

const merged = { ...central, ...wfKeys, ...extra };
const entries = Object.entries(merged).sort((a, b) => a[0].localeCompare(b[0]));

let out = `/**\n * English source dictionary — single source of truth for every UI string.\n`;
out += ` * Other locale files mirror these keys and fall back here when missing.\n`;
out += ` * Generated/maintained via the i18n pipeline; add new keys here.\n */\n`;
out += `export const en = {\n`;
for (const [k, v] of entries) out += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
out += `} as const;\n`;

const dest = path.join(__dirname, '..', 'src', 'i18n', 'locales', 'en.ts');
fs.writeFileSync(dest, out, 'utf8');
// Also emit a plain-JSON copy for the translation agents to read.
fs.writeFileSync(path.join(__dirname, 'en.json'), JSON.stringify(Object.fromEntries(entries), null, 2), 'utf8');
console.log('Wrote', entries.length, 'keys to', dest);
