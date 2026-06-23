/**
 * CategoryCard — big tappable Food / Clothes selector, the visual fork between
 * the two donation flows. Ported from `components/cards/CategoryCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, palette, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Category = 'food' | 'clothes';

const CONFIG: Record<Category, { icon: string; title: string; desc: string; accent: string; soft: string; border: string }> = {
  food: {
    icon: 'utensils',
    title: 'Food',
    desc: 'Cooked meals & packaged food',
    accent: colors.food,
    soft: colors.foodSoft,
    border: palette.orange300,
  },
  clothes: {
    icon: 'shirt',
    title: 'Clothes',
    desc: 'Garments for all seasons',
    accent: colors.clothes,
    soft: colors.clothesSoft,
    border: palette.teal300,
  },
};

export interface CategoryCardProps {
  /** Which donation flow this card starts. */
  category: Category;
  selected?: boolean;
  /** Override default title/description. */
  title?: string;
  description?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryCard({ category, selected = false, title, description, onPress, style }: CategoryCardProps) {
  const c = CONFIG[category] ?? CONFIG.food;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        {
          width: '100%',
          backgroundColor: selected ? c.soft : colors.surfaceCard,
          borderWidth: 2,
          borderColor: selected ? c.accent : colors.borderSubtle,
          borderRadius: radius.xl,
          padding: 20,
          gap: 14,
        },
        selected ? shadows.sm : shadows.sm,
        style,
      ]}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.lg,
          backgroundColor: c.soft,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: c.border,
        }}
      >
        <Icon name={c.icon} size={28} color={c.accent} />
      </View>
      <View>
        <Text variant="h3" weight={700} color={colors.textPrimary}>
          {title || c.title}
        </Text>
        <Text size={fontSize.sm} color={colors.textSecondary} style={{ marginTop: 2 }}>
          {description || c.desc}
        </Text>
      </View>
    </PressableScale>
  );
}
