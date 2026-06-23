/**
 * DonationCard — a donation item summary (category-accented) for active and
 * history lists. Ported from `components/cards/DonationCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { type LifecycleStatus, StatusBadge } from './status-badge';
import { Text } from './text';

export interface DonationMeta {
  label: string;
  icon?: string;
}

export interface DonationCardProps {
  /** @default "food" */
  category?: 'food' | 'clothes';
  title: string;
  /** Metadata pills, e.g. [{icon:'users',label:'Serves 12'}]. */
  meta?: DonationMeta[];
  status?: LifecycleStatus;
  /** Timestamp / relative time line. */
  time?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function DonationCard({
  category = 'food',
  title,
  meta = [],
  status,
  time,
  onPress,
  style,
}: DonationCardProps) {
  const isFood = category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const soft = isFood ? colors.foodSoft : colors.clothesSoft;

  const body = (
    <View
      style={[
        {
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'row',
          gap: 14,
          backgroundColor: colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
          padding: 14,
        },
        shadows.sm,
        style,
      ]}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: accent }} />
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={isFood ? 'utensils' : 'shirt'} size={24} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <Text variant="lg" weight={700} color={colors.textPrimary} numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Text>
          {status && <StatusBadge status={status} size="sm" />}
        </View>
        {meta.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4, marginTop: 6 }}>
            {meta.map((m, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {m.icon && <Icon name={m.icon} size={13} color={colors.textSecondary} />}
                <Text size={fontSize.caption} color={colors.textSecondary}>
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        )}
        {time && (
          <Text size={fontSize.caption} color={colors.textMuted} style={{ marginTop: 6 }}>
            {time}
          </Text>
        )}
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button">
      {body}
    </PressableScale>
  );
}
