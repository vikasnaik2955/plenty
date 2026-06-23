/**
 * IconButton — square/round icon-only tap target.
 * Ported from the design system `components/forms/IconButton.jsx`.
 * Variants: ghost | soft | outline | brand. Sizes: sm | md | lg.
 */
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { PressableScale } from './pressable-scale';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'ghost' | 'soft' | 'outline' | 'brand';

const SIZES: Record<Size, number> = { sm: 36, md: 44, lg: 52 };

const VARIANTS: Record<Variant, { bg: string; border: string }> = {
  ghost: { bg: 'transparent', border: 'transparent' },
  soft: { bg: colors.surfaceSunken, border: 'transparent' },
  outline: { bg: colors.surfaceCard, border: colors.borderStrong },
  brand: { bg: colors.brand, border: 'transparent' },
};

/** Foreground color for icon children — exported so callers can tint Icon. */
export const ICON_BUTTON_FG: Record<Variant, string> = {
  ghost: colors.textSecondary,
  soft: colors.textPrimary,
  outline: colors.textPrimary,
  brand: '#fff',
};

export interface IconButtonProps {
  children?: React.ReactNode;
  size?: Size;
  variant?: Variant;
  /** Fully rounded instead of rounded-square. */
  round?: boolean;
  disabled?: boolean;
  /** Required — icon buttons have no visible label. */
  accessibilityLabel: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  children,
  size = 'md',
  variant = 'ghost',
  round = false,
  disabled = false,
  accessibilityLabel,
  onPress,
  style,
}: IconButtonProps) {
  const dim = SIZES[size] ?? SIZES.md;
  const v = VARIANTS[variant] ?? VARIANTS.ghost;

  return (
    <PressableScale
      activeScale={0.92}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[
        {
          width: dim,
          height: dim,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: v.bg,
          borderWidth: 1.5,
          borderColor: v.border,
          borderRadius: round ? radius.full : radius.md,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
}
