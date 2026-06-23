/**
 * Icon — the canonical icon for the whole app. Lucide only (matches the design
 * system's Lucide-only rule). Accepts a kebab-case name like the prototype
 * (`<Icon name="map-pin" />`) and resolves it to the Lucide component.
 *
 * lucide-react-native exposes every icon as a PascalCase named export, so we
 * index the namespace by the converted name.
 */
import * as Lucide from 'lucide-react-native';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { memo } from 'react';

import { colors } from '@/theme';

export type IconName = string;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: LucideProps['style'];
}

const registry = Lucide as unknown as Record<string, LucideIcon>;
const cache: Record<string, string> = {};

/** kebab/snake-case → PascalCase, the key Lucide uses for its named exports. */
function pascal(name: string): string {
  if (cache[name]) return cache[name];
  const key = String(name)
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  cache[name] = key;
  return key;
}

function IconBase({
  name,
  size = 20,
  color = colors.textPrimary,
  strokeWidth = 2,
  style,
}: IconProps) {
  const Cmp = registry[pascal(name)];
  if (!Cmp) {
    if (__DEV__) console.warn(`[Icon] Unknown Lucide icon: "${name}"`);
    return null;
  }
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

export const Icon = memo(IconBase);
