/**
 * AppBar — top navigation bar: back, title/subtitle, action slot. 56px tall.
 * Ported from the design system `components/navigation/AppBar.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, layout, radius } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface AppBarProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron and handle it. */
  onBack?: () => void;
  /** Right-aligned action node(s) — usually IconButtons. */
  action?: React.ReactNode;
  /** Title alignment. @default "left" */
  align?: 'left' | 'center';
  /** Transparent over a colored hero. */
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppBar({ title, subtitle, onBack, action, align = 'left', transparent = false, style }: AppBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          // Extend behind the status bar; keep the 56px bar below the inset.
          height: layout.appBarHeight + insets.top,
          paddingTop: insets.top,
          paddingLeft: 6,
          paddingRight: 8,
          backgroundColor: transparent ? 'transparent' : colors.surfaceCard,
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      {onBack && (
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </PressableScale>
      )}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          alignItems: align === 'center' ? 'center' : 'flex-start',
          paddingLeft: onBack ? 0 : 8,
        }}
      >
        <Text
          variant="lg"
          weight={700}
          color={colors.textPrimary}
          numberOfLines={1}
          style={{ letterSpacing: -fontSize.lg * 0.01 }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text size={fontSize.caption} color={colors.textMuted} style={{ marginTop: -1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>{action}</View>
      {align === 'center' && onBack && !action && <View style={{ width: 44 }} />}
    </View>
  );
}
