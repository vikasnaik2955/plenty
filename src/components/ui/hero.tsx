/**
 * Hero — colored brand hero header (greeting + avatar/action), used on role home
 * screens. The web used a `linear-gradient(150deg, accent 0%, accent2 100%)`,
 * approximated here with a top-left → bottom-right LinearGradient.
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (Hero).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '@/theme';

import { Text } from './text';

export interface HeroProps {
  /** Gradient start color. @default brand */
  accent?: string;
  /** Gradient end color. @default brandStrong */
  accent2?: string;
  eyebrow?: string;
  title: string;
  /** Right-aligned node (avatar / action). */
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Hero({
  accent = colors.brand,
  accent2 = colors.brandStrong,
  eyebrow,
  title,
  right,
  children,
  style,
}: HeroProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[accent, accent2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          // Bleed under the status bar; push content below the inset.
          paddingTop: 18 + insets.top,
          paddingHorizontal: 20,
          paddingBottom: 22,
          borderBottomLeftRadius: radius['2xl'],
          borderBottomRightRadius: radius['2xl'],
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && (
            <Text size={12} weight={700} color="#fff" style={{ opacity: 0.82, letterSpacing: 12 * 0.02 }}>
              {eyebrow}
            </Text>
          )}
          <Text
            size={24}
            weight={800}
            color="#fff"
            numberOfLines={1}
            style={{ letterSpacing: -24 * 0.02, marginTop: 2 }}
          >
            {title}
          </Text>
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}
