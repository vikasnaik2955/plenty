/**
 * Plenty theme — single source of truth for the native app.
 * Mirrors the design system tokens (colors, type, spacing, shadows).
 */
import { colors } from './colors';
import { fontFamily, fontSize } from './typography';
import { radius, shadows, space } from './spacing';

export { colors, palette, statusColors, categoryColors } from './colors';
export type { DonationStatus, DonationCategory } from './colors';
export {
  fontFamily,
  weight,
  familyForWeight,
  fontSize,
  leading,
  tracking,
  ls,
  mono,
} from './typography';
export { space, radius, layout, motion, shadows } from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  radius,
  shadows,
  space,
} as const;

/** Status lifecycle order, shared across every role. */
export const STATUS_FLOW = [
  'requested',
  'accepted',
  'picked_up',
  'delivered',
  'completed',
] as const;

/** Human-readable status labels (sentence case per brand voice). */
export const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
