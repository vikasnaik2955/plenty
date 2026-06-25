/**
 * useT — returns a translate function bound to the current app language. It's
 * reactive: changing the language in the store re-renders every component that
 * calls useT, so the whole UI switches language instantly.
 */
import { useCallback } from 'react';

import { useApp } from '@/store/app-store';

import { localeFor, translate } from './translations';

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function useT(): TFunction {
  const { language } = useApp();
  const locale = localeFor(language);
  return useCallback<TFunction>((key, params) => translate(locale, key, params), [locale]);
}
