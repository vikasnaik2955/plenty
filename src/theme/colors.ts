/**
 * Plenty color system — ported from the design system `tokens/colors.css`.
 * Warm, trustworthy, community-driven. Base palettes first, then semantic
 * aliases resolved to concrete hex (React Native has no CSS custom properties).
 *
 * Keep Food = orange / Clothes = teal everywhere, and the shared status
 * lifecycle (requested → accepted → picked_up → delivered → completed/cancelled).
 */

export const palette = {
  // Brand green: giving, freshness, abundance
  green50: '#ECFBF1',
  green100: '#D1F4DD',
  green200: '#A6E9BF',
  green300: '#6FD89A',
  green400: '#3BBE76',
  green500: '#1F9D57', // primary
  green600: '#178049',
  green700: '#14653B',
  green800: '#135231',
  green900: '#0F4329',

  // Food accent: warm orange
  orange50: '#FEF3EA',
  orange100: '#FCE0CB',
  orange200: '#F8C79B',
  orange300: '#F6B27A',
  orange400: '#F09148',
  orange500: '#EA7317', // food
  orange600: '#C75D0E',
  orange700: '#9C4A0F',

  // Clothes accent: calm teal
  teal50: '#E8F7F8',
  teal100: '#C7EDF0',
  teal200: '#9CDEE3',
  teal300: '#6FCDD5',
  teal400: '#2FB1BC',
  teal500: '#0E9AA7', // clothes
  teal600: '#0A7B86',
  teal700: '#0A626B',

  // Reward gold
  gold300: '#FBD982',
  gold400: '#F5B82E',
  gold500: '#E6A012',
  gold600: '#B97D08',

  // Warm neutrals
  neutral0: '#FFFFFF',
  neutral50: '#FAF8F5',
  neutral100: '#F2EFEA',
  neutral200: '#E6E1DA',
  neutral300: '#D2CBC1',
  neutral400: '#ABA194',
  neutral500: '#82776A',
  neutral600: '#5F564B',
  neutral700: '#443E36',
  neutral800: '#2C2823',
  neutral900: '#1A1714',

  // Functional hues
  red500: '#DC4B3E',
  red50: '#FBEBE9',
  amber500: '#E6A012',
  amber50: '#FCF3DD',
  blue500: '#2F6FED',
  blue50: '#E9F0FE',
  violet500: '#6D5BD0',
  violet50: '#EEEBFA',
} as const;

/** Semantic aliases — the names screens and components should reference. */
export const colors = {
  // Brand
  brand: palette.green500,
  brandStrong: palette.green600,
  brandSoft: palette.green50,
  brandOn: '#FFFFFF',

  // Category accents
  food: palette.orange500,
  foodSoft: palette.orange50,
  foodOn: '#FFFFFF',
  clothes: palette.teal500,
  clothesSoft: palette.teal50,
  clothesOn: '#FFFFFF',

  reward: palette.gold500,
  rewardSoft: '#FBF1D6',

  // Text
  textPrimary: palette.neutral900,
  textSecondary: palette.neutral600,
  textMuted: palette.neutral500,
  textDisabled: palette.neutral400,
  textOnBrand: '#FFFFFF',
  textLink: palette.green600,

  // Surfaces
  surfacePage: palette.neutral50,
  surfaceCard: palette.neutral0,
  surfaceSunken: palette.neutral100,
  surfaceRaised: palette.neutral0,
  surfaceInverse: palette.neutral900,
  surfaceOverlay: 'rgba(26, 23, 20, 0.48)',

  // Borders
  borderSubtle: palette.neutral200,
  borderStrong: palette.neutral300,
  borderBrand: palette.green500,
  focusRing: 'rgba(31, 157, 87, 0.40)',

  // Semantic states
  success: palette.green500,
  successSoft: palette.green50,
  warning: palette.amber500,
  warningSoft: palette.amber50,
  error: palette.red500,
  errorSoft: palette.red50,
  info: palette.blue500,
  infoSoft: palette.blue50,
} as const;

/**
 * Donation lifecycle status colors.
 * requested → accepted → picked_up → delivered → completed / cancelled
 */
export const statusColors = {
  requested: { fg: palette.blue500, bg: palette.blue50 },
  accepted: { fg: palette.violet500, bg: palette.violet50 },
  picked_up: { fg: palette.orange500, bg: palette.orange50 },
  delivered: { fg: palette.teal500, bg: palette.teal50 },
  completed: { fg: palette.green600, bg: palette.green50 },
  cancelled: { fg: palette.neutral500, bg: palette.neutral100 },
} as const;

/** Category accent helper — Food = orange, Clothes = teal. */
export const categoryColors = {
  food: { fg: colors.food, soft: colors.foodSoft, on: colors.foodOn },
  clothes: { fg: colors.clothes, soft: colors.clothesSoft, on: colors.clothesOn },
} as const;

export type DonationStatus = keyof typeof statusColors;
export type DonationCategory = keyof typeof categoryColors;
