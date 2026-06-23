/**
 * VolunteerCard — volunteer contact card (assigned-volunteer reveal and the
 * team roster). Ported from `components/cards/VolunteerCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, shadows } from '@/theme';

import { Avatar } from './avatar';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Accent = 'brand' | 'food' | 'clothes' | 'neutral';

export interface VolunteerCardProps {
  name: string;
  /** @default "Volunteer" */
  role?: string;
  /** Revealed only after contact exchange unlocks. */
  phone?: string;
  rating?: number | string;
  distance?: number | string;
  /** Avatar tint. @default "brand" */
  accent?: Accent;
  onCall?: () => void;
  onMessage?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function VolunteerCard({
  name,
  role = 'Volunteer',
  phone,
  rating,
  distance,
  accent = 'brand',
  onCall,
  onMessage,
  style,
}: VolunteerCardProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
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
      <Avatar name={name} accent={accent} size="lg" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="lg" weight={700} color={colors.textPrimary}>
          {name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2, marginTop: 3 }}>
          <Text size={fontSize.caption} color={colors.textMuted}>
            {role}
          </Text>
          {rating != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Icon name="star" size={12} color={colors.reward} />
              <Text size={fontSize.caption} color={colors.textSecondary}>
                {rating}
              </Text>
            </View>
          )}
          {distance != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Icon name="map-pin" size={12} color={colors.textSecondary} />
              <Text size={fontSize.caption} color={colors.textSecondary}>
                {distance} km
              </Text>
            </View>
          )}
        </View>
        {phone && (
          <Text size={fontSize.caption} mono color={colors.textSecondary} style={{ marginTop: 4 }}>
            {phone}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {onMessage && (
          <PressableScale
            onPress={onMessage}
            accessibilityRole="button"
            accessibilityLabel="Message"
            style={iconBtn(colors.surfaceSunken)}
          >
            <Icon name="message-circle" size={18} color={colors.textPrimary} />
          </PressableScale>
        )}
        {onCall && (
          <PressableScale
            onPress={onCall}
            accessibilityRole="button"
            accessibilityLabel="Call"
            style={iconBtn(colors.brand)}
          >
            <Icon name="phone" size={18} color="#fff" />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

function iconBtn(bg: string): ViewStyle {
  return {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
