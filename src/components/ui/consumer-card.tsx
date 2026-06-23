/**
 * ConsumerCard — nearby recipient row: avatar, need size, distance, and a
 * Select action. Ported from `components/cards/ConsumerCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, shadows } from '@/theme';

import { Avatar } from './avatar';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ConsumerCardProps {
  name: string;
  /** e.g. "Community shelter", "NGO". */
  type?: string;
  /** Distance in km from the donor. */
  distance: number | string;
  /** Number of people the recipient serves (need size). */
  people: number | string;
  /** Number of location photos — shows a small "N photos" hint when > 0. */
  photoCount?: number;
  /** Donations this recipient has received this month (total). */
  monthCount?: number;
  /** Highlight that this recipient has had relatively few donations this month. */
  needsMore?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** Tapping the avatar/info area opens details (when provided). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ConsumerCard({
  name,
  type,
  distance,
  people,
  photoCount = 0,
  monthCount,
  needsMore = false,
  selected = false,
  onSelect,
  onPress,
  style,
}: ConsumerCardProps) {
  const info = (
    <>
      <Avatar name={name} accent="clothes" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="body" weight={700} color={colors.textPrimary} numberOfLines={1} style={{ flexShrink: 1 }}>
            {name}
          </Text>
          {needsMore && (
            <View style={{ backgroundColor: colors.foodSoft, borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text size={10} weight={800} color={colors.food}>
                NEEDS MORE
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2, marginTop: 3 }}>
          {type && (
            <Text size={fontSize.caption} color={colors.textMuted}>
              {type}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="users" size={13} color={colors.textSecondary} />
            <Text size={fontSize.caption} color={colors.textSecondary}>
              {people} people
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="map-pin" size={13} color={colors.textSecondary} />
            <Text size={fontSize.caption} color={colors.textSecondary}>
              {distance} km
            </Text>
          </View>
          {photoCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="image" size={13} color={colors.textSecondary} />
              <Text size={fontSize.caption} color={colors.textSecondary}>
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </Text>
            </View>
          )}
          {monthCount != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="gift" size={13} color={needsMore ? colors.food : colors.textSecondary} />
              <Text size={fontSize.caption} weight={needsMore ? 700 : 400} color={needsMore ? colors.food : colors.textSecondary}>
                {monthCount} this month
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          backgroundColor: colors.surfaceCard,
          borderWidth: 1.5,
          borderColor: selected ? colors.brand : colors.borderSubtle,
          borderRadius: radius.lg,
          padding: 14,
        },
        selected
          ? { shadowColor: colors.brand, shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }
          : shadows.sm,
        style,
      ]}
    >
      {onPress ? (
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`View ${name} details`}
          style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}
        >
          {info}
        </PressableScale>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>{info}</View>
      )}
      <PressableScale
        onPress={onSelect}
        accessibilityRole="button"
        style={{
          height: 38,
          paddingHorizontal: 16,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? colors.brand : colors.brandSoft,
        }}
      >
        <Text size={fontSize.sm} weight={700} color={selected ? '#fff' : colors.brandStrong}>
          {selected ? 'Selected' : 'Select'}
        </Text>
      </PressableScale>
    </View>
  );
}
