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

export const NAVS: Record<Role, RoleNav> = {
  donor: {
    items: [
      { key: 'home', label: 'Home', icon: 'home', route: '/(donor)/home' },
      { key: 'history', label: 'History', icon: 'clock', route: '/(donor)/history' },
      { key: 'donate', label: 'Donate', icon: 'plus', fab: true, push: '/(donor)/category' },
      { key: 'rewards', label: 'Rewards', icon: 'award', badge: 2, route: '/(donor)/rewards' },
      { key: 'profile', label: 'Profile', icon: 'user', route: '/(donor)/profile' },
    ],
  },
  volunteer: {
    items: [
      { key: 'home', label: 'Requests', icon: 'inbox', route: '/(volunteer)/requests' },
      { key: 'team', label: 'Team', icon: 'users', route: '/(volunteer)/team' },
      { key: 'rewards', label: 'Rewards', icon: 'award', route: '/(volunteer)/rewards' },
      { key: 'profile', label: 'Profile', icon: 'user', route: '/(volunteer)/profile' },
    ],
  },
  consumer: {
    items: [
      { key: 'home', label: 'Home', icon: 'home', route: '/(consumer)/home' },
      { key: 'reports', label: 'Reports', icon: 'chart-column', route: '/(consumer)/reports' },
      { key: 'profile', label: 'Profile', icon: 'user', route: '/(consumer)/profile' },
    ],
  },
  admin: {
    items: [
      { key: 'transport', label: 'Transport', icon: 'truck', route: '/(admin)/transport' },
      { key: 'alloc', label: 'Allocations', icon: 'list-checks', route: '/(admin)/allocations' },
      { key: 'audit', label: 'Audit', icon: 'scroll-text', route: '/(admin)/audit' },
    ],
  },
  transport: {
    items: [
      { key: 'home', label: 'Jobs', icon: 'package', route: '/(transport)/home' },
      { key: 'vehicle', label: 'Vehicle', icon: 'truck', route: '/(transport)/vehicle' },
      { key: 'profile', label: 'Profile', icon: 'user', route: '/(transport)/profile' },
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
