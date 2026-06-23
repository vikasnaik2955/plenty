/**
 * Plenty spacing, radii, shadows, layout & motion — ported from `tokens/spacing.css`.
 * Shadows are expressed as React Native style objects (iOS shadow* + Android elevation).
 */
import { Platform, type ViewStyle } from 'react-native';

/** 4/8 base spacing scale. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Corner radii — cards land at ~16px. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14, // inputs / buttons
  lg: 16, // cards
  xl: 20,
  '2xl': 28, // bottom sheets (top only)
  full: 999, // pills / chips / avatars
} as const;

export const layout = {
  tapTarget: 44,
  appWidth: 390,
  appHeight: 844,
  appBarHeight: 56,
  bottomNavHeight: 64,
  contentPad: 20,
} as const;

export const motion = {
  durationFast: 140,
  durationBase: 220,
  durationSlow: 320,
} as const;

/** Soft, warm-tinted shadow (rgba of near-black #1A1714). */
const warm = (o: number) => `rgba(26, 23, 20, ${o})`;

type Shadow = ViewStyle;

const shadow = (
  color: string,
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
): Shadow =>
  Platform.select<Shadow>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation, shadowColor: color },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  }) as Shadow;

export const shadows = {
  xs: shadow(warm(1), 1, 2, 0.06, 1),
  sm: shadow(warm(1), 1, 3, 0.1, 2),
  md: shadow(warm(1), 4, 12, 0.12, 5),
  lg: shadow(warm(1), 12, 22, 0.16, 10),
  xl: shadow(warm(1), 24, 40, 0.2, 16),
  // Green glow reserved for the primary CTA.
  brand: shadow('rgba(31, 157, 87, 1)', 8, 18, 0.34, 8),
} as const;
