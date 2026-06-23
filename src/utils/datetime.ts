/**
 * Date/time formatting for Plenty. Timestamps are stored as epoch milliseconds
 * (captured with Date.now() when an action happens) and formatted on display,
 * so dates stay correct regardless of when a screen re-renders.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Midnight timestamp for the day containing `ms` — used to group by day. */
export function dayKey(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "2026-5" key for the month containing `ms` — used to count per-month and reset. */
export function monthKey(ms: number = Date.now()): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

/** Monday-00:00 epoch ms for the week containing `ms` — groups by week (streaks). */
export function weekKey(ms: number = Date.now()): number {
  const d = new Date(ms);
  const offset = (d.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset).getTime();
}

/** "2026-Q2" key for the quarter containing `ms` — used to reset the grace week. */
export function quarterKey(ms: number = Date.now()): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

/** Human month + year, e.g. "June 2026". */
export function monthName(ms: number = Date.now()): string {
  const d = new Date(ms);
  const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/** "4:02 PM" */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${pad(d.getMinutes())} ${ap}`;
}

/** "21 Jun 2026" */
export function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Compact stamp for timelines: "21 Jun, 4:02 PM" */
export function formatStamp(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${formatTime(ms)}`;
}

/** Full stamp: "21 Jun 2026, 4:02 PM" */
export function formatDateTime(ms: number): string {
  return `${formatDate(ms)}, ${formatTime(ms)}`;
}

/** WhatsApp-style day separator: Today / Yesterday / weekday (this week) / date. */
export function formatDayLabel(ms: number, nowMs: number = Date.now()): string {
  const diffDays = Math.round((dayKey(nowMs) - dayKey(ms)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return WEEKDAYS[new Date(ms).getDay()];
  return formatDate(ms);
}

/** "just now", "5 min ago", "3 h ago", "2 d ago", then a date. */
export function formatRelative(ms: number, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} d ago`;
  return formatDate(ms);
}
