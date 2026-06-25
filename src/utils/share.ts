/**
 * Share-your-impact — opens the native share sheet with a motivating, role-
 * specific caption (plus the app + website links) so a user can post their
 * activity to WhatsApp, Instagram, college groups, etc. and invite others.
 *
 * Captions live in i18n (`share.*Caption`) — English by default, falling back to
 * English in locales without a translation. Uses the built-in RN Share API (no
 * extra dependency).
 */
import { Share } from 'react-native';

import { APP_LINK, WEBSITE_LINK } from '@/config/links';
import type { TFunction } from '@/i18n/use-t';
import type { Role } from '@/data/types';

const CAPTION_KEY: Record<Role, string> = {
  donor: 'share.donorCaption',
  volunteer: 'share.volunteerCaption',
  transport: 'share.transportCaption',
  admin: 'share.adminCaption',
  consumer: 'share.donorCaption',
};

/** Open the share sheet with the caption for `role`. */
export async function shareImpact(t: TFunction, role: Role): Promise<void> {
  const message = t(CAPTION_KEY[role] ?? 'share.donorCaption', { app: APP_LINK, website: WEBSITE_LINK });
  try {
    await Share.share({ message });
  } catch {
    // User dismissed the sheet or sharing is unavailable — no-op.
  }
}
