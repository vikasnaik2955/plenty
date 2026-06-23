/**
 * NotificationCard — in-app notification row for the notifications center.
 * Ported from the design system `components/cards/NotificationCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, statusColors } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type NotificationType = 'status' | 'accepted' | 'reward' | 'request' | 'delivered';

const TYPES: Record<NotificationType, { icon: string; accent: string; soft: string }> = {
  status: { icon: 'refresh-cw', accent: colors.info, soft: colors.infoSoft },
  accepted: { icon: 'check-circle', accent: statusColors.accepted.fg, soft: statusColors.accepted.bg },
  reward: { icon: 'award', accent: colors.reward, soft: colors.rewardSoft },
  request: { icon: 'bell', accent: colors.brand, soft: colors.brandSoft },
  delivered: { icon: 'package-check', accent: statusColors.delivered.fg, soft: statusColors.delivered.bg },
};

export interface NotificationCardProps {
  /** Picks the icon + accent. @default "status" */
  type?: NotificationType;
  title: string;
  message?: string;
  time?: string;
  /** Highlights the row and shows an unread dot. */
  unread?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function NotificationCard({
  type = 'status',
  title,
  message,
  time,
  unread = false,
  onPress,
  style,
}: NotificationCardProps) {
  const t = TYPES[type] ?? TYPES.status;

  const body = (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
          paddingVertical: 13,
          paddingHorizontal: 14,
          backgroundColor: unread ? colors.brandSoft : colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          backgroundColor: t.soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={t.icon} size={20} color={t.accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text variant="body" weight={700} color={colors.textPrimary} style={{ flex: 1 }}>
            {title}
          </Text>
          {time && (
            <Text size={fontSize.caption} color={colors.textMuted}>
              {time}
            </Text>
          )}
        </View>
        {message && (
          <Text size={fontSize.sm} color={colors.textSecondary} style={{ marginTop: 2, lineHeight: fontSize.sm * 1.28 }}>
            {message}
          </Text>
        )}
      </View>
      {unread && (
        <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.brand, marginTop: 5 }} />
      )}
    </View>
  );

  if (!onPress) return body;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button">
      {body}
    </PressableScale>
  );
}
