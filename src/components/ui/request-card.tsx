/**
 * RequestCard — incoming open request for a volunteer, with Accept / Decline.
 * Ported from the design system `components/cards/RequestCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { useT } from '@/i18n/use-t';
import { colors, fontSize, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { StatusBadge } from './status-badge';
import { Text } from './text';

export interface RequestCardProps {
  /** @default "food" */
  category?: 'food' | 'clothes';
  title: string;
  /** Donor name. */
  donor?: string;
  distance?: number | string;
  /** Need size (people served). */
  people?: number | string;
  /** e.g. "Pickup before 8 PM". */
  time?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  /** Primary button label. Defaults to the translated "Accept". */
  acceptLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function Meta({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name={icon} size={15} color={colors.textSecondary} />
      <Text size={fontSize.sm} weight={500} color={colors.textSecondary}>
        {label}
      </Text>
    </View>
  );
}

export function RequestCard({
  category = 'food',
  title,
  donor,
  distance,
  people,
  time,
  onAccept,
  onDecline,
  acceptLabel,
  style,
}: RequestCardProps) {
  const t = useT();
  const isFood = category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const soft = isFood ? colors.foodSoft : colors.clothesSoft;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
          padding: 16,
        },
        shadows.md,
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: soft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={isFood ? 'utensils' : 'shirt'} size={22} color={accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="lg" weight={700} color={colors.textPrimary}>
            {title}
          </Text>
          {donor && (
            <Text size={fontSize.caption} color={colors.textMuted} style={{ marginTop: 1 }}>
              {t('requestCard.from', { donor })}
            </Text>
          )}
        </View>
        <StatusBadge tone={isFood ? 'food' : 'clothes'} dot={false} size="sm">
          {isFood ? t('requestCard.food') : t('requestCard.clothes')}
        </StatusBadge>
      </View>
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, marginTop: 12, marginBottom: 14 }}
      >
        {people != null && <Meta icon="users" label={t('requestCard.serves', { count: people })} />}
        {distance != null && <Meta icon="navigation" label={t('requestCard.kmAway', { distance })} />}
        {time && <Meta icon="clock" label={time} />}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PressableScale
          onPress={onDecline}
          accessibilityRole="button"
          style={{
            flex: 1,
            height: 46,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: colors.borderStrong,
            backgroundColor: colors.surfaceCard,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="body" weight={700} color={colors.textSecondary}>
            {t('requestCard.decline')}
          </Text>
        </PressableScale>
        <PressableScale
          onPress={onAccept}
          accessibilityRole="button"
          style={[
            {
              flex: 1,
              height: 46,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: 'transparent',
              backgroundColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadows.brand,
          ]}
        >
          <Text variant="body" weight={700} color="#fff">
            {acceptLabel ?? t('requestCard.accept')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
