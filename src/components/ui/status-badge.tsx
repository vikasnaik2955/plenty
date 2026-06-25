/**
 * StatusBadge — color-coded status/category pill. The single source of status
 * color across all roles. Pass `status` for a lifecycle stage, or `tone`.
 * Ported from the design system `components/data-display/StatusBadge.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { useT } from '@/i18n/use-t';
import { colors, type DonationStatus, palette, radius, statusColors } from '@/theme';

import { Text } from './text';

export type LifecycleStatus = DonationStatus;
export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'food' | 'clothes' | 'neutral';

const TONES: Record<BadgeTone, { fg: string; bg: string }> = {
  success: { fg: palette.green700, bg: colors.successSoft },
  warning: { fg: palette.gold600, bg: colors.warningSoft },
  error: { fg: palette.red500, bg: colors.errorSoft },
  info: { fg: palette.blue500, bg: colors.infoSoft },
  food: { fg: palette.orange600, bg: colors.foodSoft },
  clothes: { fg: palette.teal600, bg: colors.clothesSoft },
  neutral: { fg: colors.textSecondary, bg: colors.surfaceSunken },
};

export interface StatusBadgeProps {
  /** A donation lifecycle stage — sets label + color automatically. */
  status?: LifecycleStatus;
  /** Generic semantic/category tone (ignored if `status` is set). */
  tone?: BadgeTone;
  /** Override the label text. */
  children?: React.ReactNode;
  /** Leading dot. @default true */
  dot?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({ status, tone, children, dot = true, size = 'md', style }: StatusBadgeProps) {
  const t = useT();
  const conf = status ? statusColors[status] : TONES[tone ?? 'neutral'];
  const label = children ?? (status ? t(`status.${status}`) : null);
  const sm = size === 'sm';

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: dot ? 6 : 0,
          paddingVertical: sm ? 3 : 5,
          paddingHorizontal: sm ? 9 : 11,
          borderRadius: radius.full,
          backgroundColor: conf.bg,
        },
        style,
      ]}
    >
      {dot && (
        <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: conf.fg }} />
      )}
      {typeof label === 'string' || typeof label === 'number' ? (
        <Text size={sm ? 11 : 13} weight={700} color={conf.fg} style={{ lineHeight: (sm ? 11 : 13) * 1.2 }}>
          {label}
        </Text>
      ) : (
        label
      )}
    </View>
  );
}
