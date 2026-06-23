/**
 * EmptyState — supportive empty state for no-history / no-requests /
 * no-notifications screens. Ported from `components/feedback/EmptyState.jsx`.
 */
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, leading, radius } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

type Accent = 'brand' | 'food' | 'clothes' | 'neutral';

const ACCENTS: Record<Accent, [string, string]> = {
  brand: [colors.brandSoft, colors.brand],
  food: [colors.foodSoft, colors.food],
  clothes: [colors.clothesSoft, colors.clothes],
  neutral: [colors.surfaceSunken, colors.textMuted],
};

export interface EmptyStateProps {
  /** Lucide icon name. @default "inbox" */
  icon?: string;
  title: string;
  message?: string;
  /** Optional CTA node (usually a Button). */
  action?: React.ReactNode;
  /** Icon tile tint. @default "brand" */
  accent?: Accent;
  /** Tighter padding for in-list empties. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'inbox',
  title,
  message,
  action,
  accent = 'brand',
  compact = false,
  style,
}: EmptyStateProps) {
  const [bg, fg] = ACCENTS[accent] ?? ACCENTS.brand;

  return (
    <View
      style={[
        {
          alignItems: 'center',
          paddingVertical: compact ? 24 : 40,
          paddingHorizontal: compact ? 20 : 24,
        },
        style,
      ]}
    >
      <View
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          borderRadius: radius.xl,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={compact ? 28 : 34} color={fg} />
      </View>
      <Text variant="h3" weight={700} color={colors.textPrimary} align="center">
        {title}
      </Text>
      {message && (
        <Text
          variant="body"
          color={colors.textSecondary}
          align="center"
          style={{ marginTop: 6, maxWidth: 280, lineHeight: 15 * leading.normal }}
        >
          {message}
        </Text>
      )}
      {action && <View style={{ marginTop: 18 }}>{action}</View>}
    </View>
  );
}
