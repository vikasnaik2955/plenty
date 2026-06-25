/**
 * i18n registry + lookup. This module has NO React/store dependency so it can be
 * imported anywhere (including the store, for translated toasts/notifications).
 *
 * `en` is the source of truth (every key lives here). Other locales may be
 * partial — `translate` falls back to English, then to the key itself, so a
 * missing translation never breaks the UI.
 */
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { bn } from './locales/bn';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { kn } from './locales/kn';

export type Locale = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn';
export type Messages = Record<string, string>;
export type MessageKey = keyof typeof en;

/** Display name stored in `store.language` → locale code. */
export const LANGUAGE_TO_LOCALE: Record<string, Locale> = {
  English: 'en',
  Hindi: 'hi',
  Marathi: 'mr',
  Gujarati: 'gu',
  Bengali: 'bn',
  Tamil: 'ta',
  Telugu: 'te',
  Kannada: 'kn',
};

const DICTS: Record<Locale, Messages> = { en, hi, mr, gu, bn, ta, te, kn };

export function localeFor(language: string | undefined): Locale {
  return (language && LANGUAGE_TO_LOCALE[language]) || 'en';
}

/**
 * Translate `key` for `locale`. Interpolates `{name}` placeholders from `params`.
 * Falls back to English, then to the key itself.
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = DICTS[locale] ?? en;
  let str = dict[key] ?? (en as Messages)[key] ?? key;
  if (params) {
    for (const p of Object.keys(params)) {
      str = str.split(`{${p}}`).join(String(params[p]));
    }
  }
  return str;
}
