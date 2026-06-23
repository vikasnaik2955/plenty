/**
 * Plenty type scale — ported from `tokens/typography.css`.
 * Family: Plus Jakarta Sans (loaded via @expo-google-fonts/plus-jakarta-sans).
 * Font family names below match the keys registered in the root layout's useFonts.
 */

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extra: '800',
} as const;

/** Resolve a numeric/string weight to the matching Plus Jakarta Sans family. */
export function familyForWeight(w?: number | string): string {
  const n = typeof w === 'string' ? parseInt(w, 10) : w ?? 400;
  if (n >= 800) return fontFamily.extra;
  if (n >= 700) return fontFamily.bold;
  if (n >= 600) return fontFamily.semibold;
  if (n >= 500) return fontFamily.medium;
  return fontFamily.regular;
}

export const fontSize = {
  display: 40,
  h1: 32,
  h2: 26,
  h3: 21,
  lg: 17,
  body: 15,
  sm: 14,
  caption: 13,
  overline: 11,
} as const;

export const leading = {
  tight: 1.12,
  snug: 1.28,
  normal: 1.5,
  relaxed: 1.62,
} as const;

export const tracking = {
  tight: -0.02, // em — multiply by fontSize for RN letterSpacing
  normal: 0,
  wide: 0.04,
  overline: 0.1,
} as const;

/** letterSpacing in RN is in px; convert an em tracking value for a given size. */
export const ls = (em: number, size: number): number => em * size;

export const mono = 'monospace';
