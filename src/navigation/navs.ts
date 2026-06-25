/**
 * Per-role bottom navigation config, ported from `NAVS` in the prototype's
 * `app.jsx`. Each item maps to either a tab route (switched with replace) or a
 * pushed sub-flow (the donor "Donate" FAB).
 */
import type { Href } from 'expo-router';
import type { Role } from '@/data/types';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
  fab?: boolean;
  /** Tab route to switch to (replace). */
  route?: Href;
  /** Sub-flow to push instead of switching tab. */
  push?: Href;
}

export interface RoleNav {
  items: NavItem[];
}

// `label` holds an i18n key (e.g. 'nav.home'); the bottom nav translates it.
export const NAVS: Record<Role, RoleNav> = {
  donor: {
    items: [
      { key: 'home', label: 'nav.home', icon: 'home', route: '/(donor)/home' },
      { key: 'history', label: 'nav.history', icon: 'clock', route: '/(donor)/history' },
      { key: 'donate', label: 'nav.donate', icon: 'plus', fab: true, push: '/(donor)/category' },
      { key: 'rewards', label: 'nav.rewards', icon: 'award', badge: 2, route: '/(donor)/rewards' },
      { key: 'profile', label: 'nav.profile', icon: 'user', route: '/(donor)/profile' },
    ],
  },
  volunteer: {
    items: [
      { key: 'home', label: 'nav.requests', icon: 'inbox', route: '/(volunteer)/requests' },
      { key: 'team', label: 'nav.team', icon: 'users', route: '/(volunteer)/team' },
      { key: 'rewards', label: 'nav.rewards', icon: 'award', route: '/(volunteer)/rewards' },
      { key: 'profile', label: 'nav.profile', icon: 'user', route: '/(volunteer)/profile' },
    ],
  },
  consumer: {
    items: [
      { key: 'home', label: 'nav.home', icon: 'home', route: '/(consumer)/home' },
      { key: 'reports', label: 'nav.reports', icon: 'chart-column', route: '/(consumer)/reports' },
      { key: 'profile', label: 'nav.profile', icon: 'user', route: '/(consumer)/profile' },
    ],
  },
  admin: {
    items: [
      { key: 'transport', label: 'nav.transport', icon: 'truck', route: '/(admin)/transport' },
      { key: 'alloc', label: 'nav.allocations', icon: 'list-checks', route: '/(admin)/allocations' },
      { key: 'audit', label: 'nav.audit', icon: 'scroll-text', route: '/(admin)/audit' },
    ],
  },
  transport: {
    items: [
      { key: 'home', label: 'nav.jobs', icon: 'package', route: '/(transport)/home' },
      { key: 'vehicle', label: 'nav.vehicle', icon: 'truck', route: '/(transport)/vehicle' },
      { key: 'profile', label: 'nav.profile', icon: 'user', route: '/(transport)/profile' },
    ],
  },
};

/** Home route per role, used after role selection / auth. */
export const ROLE_HOME: Record<Role, Href> = {
  donor: '/(donor)/home',
  volunteer: '/(volunteer)/requests',
  consumer: '/(consumer)/home',
  admin: '/(admin)/transport',
  transport: '/(transport)/home',
};
