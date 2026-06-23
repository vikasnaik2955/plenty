/**
 * StatCard — compact metric tile for dashboards, rewards, and reports.
 * Lay several in a flex row. Ported from `components/data-display/StatCard.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, fontSize, palette, radius, shadows } from '@/theme';

import { Text } from './text';

type Accent = 'brand' | 'food' | 'clothes' | 'reward' | 'neutral';

const ACCENTS: Record<Accent, [string, string]> = {
  brand: [colors.brandSoft, colors.brandStrong],
  food: [colors.foodSoft, palette.orange600],
  clothes: [colors.clothesSoft, palette.teal600],
  reward: [colors.rewardSoft, palette.gold600],
  neutral: [colors.surfaceSunken, colors.textPrimary],
};

export interface StatCardProps {
  value: React.ReactNode;
  label: string;
  /** Icon node (e.g. an <Icon />). The accent tints its tile. */
  icon?: React.ReactNode;
  /** Accent for the icon tile. @default "brand" */
  accent?: Accent;
  /** Small trend string, e.g. "+12%". */
  trend?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ value, label, icon, accent = 'brand', trend, style }: StatCardProps) {
  const [bg] = ACCENTS[accent] ?? ACCENTS.brand;

  return (
    <View
      style={[
        {
          flex: 1,
          minWidth: 0,
          backgroundColor: colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
          padding: 16,
        },
        shadows.sm,
        style,
      ]}
    >
      {icon && (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          {icon}
        </View>
      )}
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text variant="h2" weight={800} color={colors.textPrimary} style={{ lineHeight: fontSize.h2 * 1.1 }}>
          {value}
        </Text>
      ) : (
        value
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <Text size={fontSize.caption} weight={600} color={colors.textMuted}>
          {label}
        </Text>
        {trend && (
          <Text size={fontSize.caption} weight={700} color={colors.success}>
            {trend}
          </Text>
        )}
      </View>
    </View>
  );
}
