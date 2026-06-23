/**
 * BottomNav — role-aware bottom tab bar. 64px tall, supports a raised center FAB
 * and badges. Honors the safe-area bottom inset.
 * Ported from the design system `components/navigation/BottomNav.jsx`.
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, shadows } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface BottomNavItem {
  key: string;
  label: string;
  /** Lucide icon name. */
  icon: string;
  /** Optional badge count/dot. */
  badge?: number | string;
  /** Render as a raised center action button. */
  fab?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  onChange?: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function BottomNav({ items = [], active, onChange, style }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'stretch',
          height: layout.bottomNavHeight + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surfaceCard,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      {items.map((it) => {
        const on = it.key === active;

        if (it.fab) {
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange?.(it.key)}
              accessibilityRole="button"
              accessibilityLabel={it.label}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <View
                style={[
                  {
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.brand,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ translateY: -12 }],
                  },
                  shadows.brand,
                ]}
              >
                <Icon name={it.icon} size={26} color="#fff" />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={it.key}
            onPress={() => onChange?.(it.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <View>
              <Icon
                name={it.icon}
                size={23}
                strokeWidth={on ? 2.4 : 2}
                color={on ? colors.brandStrong : colors.textMuted}
              />
              {it.badge != null && it.badge !== '' ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -7,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: colors.error,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: colors.surfaceCard,
                  }}
                >
                  <Text size={10} weight={800} color="#fff">
                    {it.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text size={11} weight={on ? 700 : 600} color={on ? colors.brandStrong : colors.textMuted}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
