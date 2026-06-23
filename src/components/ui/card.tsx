/**
 * Card — the base rounded surface (radius-lg, soft shadow) every other card is
 * built on. Ported from the design system `components/cards/Card.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme';

import { PressableScale } from './pressable-scale';

type AccentKey = 'food' | 'clothes' | 'brand' | 'reward';

const ACCENT_COLORS: Record<AccentKey, string> = {
  food: colors.food,
  clothes: colors.clothes,
  brand: colors.brand,
  reward: colors.reward,
};

export interface CardProps {
  children?: React.ReactNode;
  /** Inner padding in px. @default 16 */
  padding?: number;
  /** Adds a stronger resting shadow (web added hover lift). */
  interactive?: boolean;
  /** Left accent bar — "food" | "clothes" | "brand" | "reward" | any color. */
  accentBar?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, padding = 16, interactive = false, accentBar, onPress, style }: CardProps) {
  const accentColor = accentBar
    ? ACCENT_COLORS[accentBar as AccentKey] ?? accentBar
    : undefined;

  const body = (
    <View
      style={[
        {
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
          padding,
        },
        interactive ? shadows.md : shadows.sm,
        style,
      ]}
    >
      {accentColor && (
        <View
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: accentColor }}
        />
      )}
      {children}
    </View>
  );

  if (!onPress) return body;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button">
      {body}
    </PressableScale>
  );
}
