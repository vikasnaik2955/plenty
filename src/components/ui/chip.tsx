/**
 * Chip — compact filter/selection chip for toolbars and filter rows.
 * Ported from the design system `components/data-display/Chip.jsx`.
 */
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, palette, radius } from '@/theme';

import { Text } from './text';

type Accent = 'brand' | 'food' | 'clothes' | 'neutral';

const ACCENTS: Record<Accent, { fg: string; bg: string; border: string }> = {
  brand: { fg: colors.brandStrong, bg: colors.brandSoft, border: palette.green300 },
  food: { fg: palette.orange600, bg: colors.foodSoft, border: palette.orange300 },
  clothes: { fg: palette.teal600, bg: colors.clothesSoft, border: palette.teal300 },
  neutral: { fg: colors.textPrimary, bg: colors.surfaceSunken, border: colors.borderStrong },
};

export interface ChipProps {
  children?: React.ReactNode;
  /** Selected (filled) state. */
  selected?: boolean;
  leftIcon?: React.ReactNode;
  /** Accent color when selected. @default "brand" */
  accent?: Accent;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ children, selected = false, leftIcon, accent = 'brand', onPress, style }: ChipProps) {
  const a = ACCENTS[accent] ?? ACCENTS.brand;

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          height: 36,
          paddingHorizontal: 14,
          borderRadius: radius.full,
          backgroundColor: selected ? a.bg : colors.surfaceCard,
          borderWidth: 1.5,
          borderColor: selected ? a.border : colors.borderSubtle,
        },
        style,
      ]}
    >
      {leftIcon}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text size={fontSize.sm} weight={600} color={selected ? a.fg : colors.textSecondary}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
