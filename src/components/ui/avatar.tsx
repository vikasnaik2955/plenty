/**
 * Avatar — circular avatar with initials fallback, optional image and status ring.
 * Ported from the design system `components/data-display/Avatar.jsx`.
 */
import { Image } from 'expo-image';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, palette } from '@/theme';

import { Text } from './text';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Accent = 'brand' | 'food' | 'clothes' | 'neutral';

const SIZES: Record<Size, number> = { xs: 28, sm: 36, md: 44, lg: 56, xl: 72 };

const ACCENTS: Record<Accent, [string, string]> = {
  brand: [palette.green100, palette.green700],
  food: [palette.orange100, palette.orange700],
  clothes: [palette.teal100, palette.teal700],
  neutral: [palette.neutral200, palette.neutral700],
};

function initials(name = ''): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

export interface AvatarProps {
  /** Used for initials fallback and alt text. */
  name?: string;
  /** Image URL; falls back to initials when absent. */
  src?: string;
  /** @default "md" */
  size?: Size;
  /** Initials color theme. @default "brand" */
  accent?: Accent;
  /** Brand status ring. */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name = '', src, size = 'md', accent = 'brand', ring = false, style }: AvatarProps) {
  const dim = SIZES[size] ?? SIZES.md;
  const [bg, fg] = ACCENTS[accent] ?? ACCENTS.brand;

  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          overflow: 'hidden',
        },
        ring && {
          borderWidth: 3,
          borderColor: colors.surfaceCard,
          shadowColor: colors.brand,
          shadowOpacity: 1,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <Text size={dim * 0.36} weight={700} color={fg}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}
