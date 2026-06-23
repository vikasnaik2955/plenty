/**
 * DetailRow — small labeled key/value used in detail screens.
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (DetailRow).
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface DetailRowProps {
  /** Lucide icon name. */
  icon: string;
  label: string;
  value: React.ReactNode;
  /** Icon tint. @default textMuted */
  accent?: string;
  style?: StyleProp<ViewStyle>;
}

export function DetailRow({ icon, label, value, accent = colors.textMuted, style }: DetailRowProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
          paddingVertical: 11,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      <View style={{ marginTop: 1 }}>
        <Icon name={icon} size={18} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text size={12} weight={600} color={colors.textMuted}>
          {label}
        </Text>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text size={15} weight={600} color={colors.textPrimary} style={{ marginTop: 1 }}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}
