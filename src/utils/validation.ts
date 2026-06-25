/**
 * Required-field validation. Forms call `requireFields(...)` on submit: if any
 * asterisk-marked field is empty it shows an error alert listing the missing
 * fields (translated) and returns false, blocking the submit.
 */
import { Alert } from 'react-native';

import type { TFunction } from '@/i18n/use-t';

export interface RequiredField {
  /** The field's current value. Empty = '', null, undefined, false, [], NaN, or <= 0. */
  value: unknown;
  /** Translated label shown in the error popup. */
  label: string;
}

/** Labels of the required fields that are still empty. */
export function missingRequired(fields: RequiredField[]): string[] {
  return fields
    .filter((f) => {
      const v = f.value;
      if (v === null || v === undefined || v === false) return true;
      if (typeof v === 'string') return v.trim().length === 0;
      if (typeof v === 'number') return Number.isNaN(v) || v <= 0;
      if (Array.isArray(v)) return v.length === 0;
      return false;
    })
    .map((f) => f.label);
}

/**
 * Validate required fields. Returns true when all are filled; otherwise shows an
 * error popup naming the empty fields and returns false.
 */
export function requireFields(fields: RequiredField[], t: TFunction): boolean {
  const missing = missingRequired(fields);
  if (missing.length === 0) return true;
  Alert.alert(t('validation.title'), t('validation.message', { fields: missing.map((m) => `•  ${m}`).join('\n') }));
  return false;
}
