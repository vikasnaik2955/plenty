/**
 * Tabs — in-page tabs (segmented control or underline). For filters and report
 * periods. Ported from the design system `components/navigation/Tabs.jsx`.
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, radius, shadows } from '@/theme';

import { Text } from './text';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  /** @default "segmented" */
  variant?: 'segmented' | 'underline';
  style?: StyleProp<ViewStyle>;
}

export function Tabs({ items = [], active, onChange, variant = 'segmented', style }: TabsProps) {
  if (variant === 'underline') {
    return (
      <View
        style={[
          { flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
          style,
        ]}
      >
        {items.map((it) => {
          const on = it.key === active;
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange?.(it.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderBottomWidth: 2.5,
                borderBottomColor: on ? colors.brand : 'transparent',
                marginBottom: -1,
              }}
            >
              <Text size={fontSize.sm} weight={700} color={on ? colors.brandStrong : colors.textMuted}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 4,
          padding: 4,
          backgroundColor: colors.surfaceSunken,
          borderRadius: radius.md,
        },
        style,
      ]}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange?.(it.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[
              {
                flex: 1,
                height: 38,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? colors.surfaceCard : 'transparent',
              },
              on && shadows.xs,
            ]}
          >
            <Text size={fontSize.sm} weight={700} color={on ? colors.textPrimary : colors.textMuted}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
