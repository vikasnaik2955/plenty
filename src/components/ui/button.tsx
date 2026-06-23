/**
 * Button — primary action button, bottom-anchored for key flows.
 * Ported from the design system `components/forms/Button.jsx`.
 * Variants: primary | secondary | ghost | destructive. Sizes: sm | md | lg.
 */
import { ActivityIndicator, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { height: number; padH: number; fontSize: number; gap: number; icon: number; radius: number }> = {
  sm: { height: 36, padH: 14, fontSize: 14, gap: 6, icon: 16, radius: radius.md },
  md: { height: 46, padH: 18, fontSize: 15, gap: 8, icon: 18, radius: radius.md },
  lg: { height: 54, padH: 22, fontSize: 17, gap: 9, icon: 20, radius: radius.lg },
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.brand, fg: colors.brandOn, border: 'transparent' },
  secondary: { bg: colors.surfaceCard, fg: colors.textPrimary, border: colors.borderStrong },
  ghost: { bg: 'transparent', fg: colors.brandStrong, border: 'transparent' },
  destructive: { bg: colors.error, fg: '#fff', border: 'transparent' },
};

export interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  const isOff = disabled || loading;
  const fg = isOff ? colors.textDisabled : v.fg;

  return (
    <PressableScale
      disabled={isOff}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isOff, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s.gap,
          height: s.height,
          minWidth: s.height,
          paddingHorizontal: s.padH,
          borderRadius: s.radius,
          borderWidth: 1.5,
          borderColor: isOff ? 'transparent' : v.border,
          backgroundColor: isOff ? colors.borderSubtle : v.bg,
        },
        fullWidth && { width: '100%' },
        !isOff && variant === 'primary' && shadows.brand,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={fg} />}
      {!loading && leftIcon && <Icon name={leftIcon} size={s.icon} color={fg} />}
      {typeof children === 'string' ? (
        <Text size={s.fontSize} weight={700} color={fg} style={{ letterSpacing: -0.15 }}>
          {children}
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s.gap }}>{children}</View>
      )}
      {!loading && rightIcon && <Icon name={rightIcon} size={s.icon} color={fg} />}
    </PressableScale>
  );
}
