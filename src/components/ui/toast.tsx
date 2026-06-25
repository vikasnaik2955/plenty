/**
 * Toast — snackbar for transient feedback ("Request sent", "Volunteer assigned").
 * Presentational only; the caller (store) controls show/dismiss timing.
 * Ported from the design system `components/feedback/Toast.jsx`.
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useT } from '@/i18n/use-t';
import { colors, fontSize, palette, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

type Tone = 'success' | 'error' | 'warning' | 'info';

const TONES: Record<Tone, { fg: string; bg: string; border: string; icon: string }> = {
  success: { fg: palette.green700, bg: colors.successSoft, border: palette.green200, icon: 'check-circle' },
  error: { fg: palette.red500, bg: colors.errorSoft, border: '#F3C9C4', icon: 'alert-circle' },
  warning: { fg: palette.gold600, bg: colors.warningSoft, border: '#F1DFA6', icon: 'alert-triangle' },
  info: { fg: colors.textPrimary, bg: colors.surfaceInverse, border: 'transparent', icon: 'info' },
};

export interface ToastProps {
  message: string;
  /** @default "info" (dark). */
  tone?: Tone;
  /** Override the leading Lucide icon name. */
  icon?: string;
  /** Optional inline action label. */
  action?: string;
  onAction?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Toast({ message, tone = 'info', icon, action, onAction, onClose, style }: ToastProps) {
  const tr = useT();
  const t = TONES[tone] ?? TONES.info;
  const dark = tone === 'info';
  const iconColor = dark ? '#fff' : t.fg;

  return (
    <View
      accessibilityRole="alert"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: radius.md,
          backgroundColor: t.bg,
          borderWidth: 1,
          borderColor: t.border,
          maxWidth: 360,
        },
        shadows.lg,
        style,
      ]}
    >
      <Icon name={icon || t.icon} size={20} color={iconColor} />
      <Text size={fontSize.sm} weight={600} color={dark ? '#fff' : colors.textPrimary} style={{ flex: 1 }}>
        {message}
      </Text>
      {action && (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text size={fontSize.sm} weight={800} color={dark ? palette.green300 : t.fg}>
            {action}
          </Text>
        </Pressable>
      )}
      {onClose && (
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={tr('common.close')}>
          <Icon name="x" size={16} color={dark ? 'rgba(255,255,255,0.7)' : colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
