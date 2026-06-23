/**
 * SectionHeader — section heading with optional trailing action (e.g. "See all").
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (SectionHeader).
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  /** Trailing action label, e.g. "See all". */
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 20,
          marginBottom: 10,
        },
        style,
      ]}
    >
      <Text size={15} weight={800} color={colors.textPrimary} style={{ letterSpacing: -15 * 0.01 }}>
        {title}
      </Text>
      {action && (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text size={13} weight={700} color={colors.brandStrong}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
