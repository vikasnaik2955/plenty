/**
 * Role metadata for onboarding (RoleSelect / Auth), ported from `ROLES` in
 * SharedScreens.jsx. Colors resolved to theme tokens.
 */
import { colors, palette } from '@/theme';
import type { Role } from '@/data/types';

export interface RoleMeta {
  key: Role;
  label: string;
  desc: string;
  icon: string;
  accent: string;
  soft: string;
}

// Recipients (NGOs/shelters we deliver to) don't use the app — donors register
// and manage them as destinations, so there's no Recipient login role.
export const ROLES: RoleMeta[] = [
  { key: 'donor', label: 'Donor', desc: 'Share surplus food or clothes', icon: 'hand-heart', accent: colors.brand, soft: colors.brandSoft },
  { key: 'volunteer', label: 'Volunteer', desc: 'Pick up and deliver donations', icon: 'bike', accent: colors.food, soft: colors.foodSoft },
  { key: 'transport', label: 'Transport', desc: 'Offer rides — free or paid', icon: 'truck', accent: palette.violet500, soft: palette.violet50 },
  { key: 'admin', label: 'Admin', desc: 'Manage fleet & oversight', icon: 'shield-check', accent: colors.clothes, soft: colors.clothesSoft },
];
