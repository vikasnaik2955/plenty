/**
 * Text — themed wrapper over React Native Text that applies Plus Jakarta Sans
 * and the Plenty type scale. Use the `variant` prop for the role tokens, or pass
 * `size`/`weight`/`color` directly. Keeps the brand's sentence-case, warm voice.
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { colors, familyForWeight, fontSize, ls, tracking } from '@/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'lg'
  | 'body'
  | 'sm'
  | 'caption'
  | 'overline';

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontSize: fontSize.display, fontWeight: '800', letterSpacing: ls(tracking.tight, fontSize.display) },
  h1: { fontSize: fontSize.h1, fontWeight: '800', letterSpacing: ls(tracking.tight, fontSize.h1) },
  h2: { fontSize: fontSize.h2, fontWeight: '800', letterSpacing: ls(tracking.tight, fontSize.h2) },
  h3: { fontSize: fontSize.h3, fontWeight: '700', letterSpacing: ls(tracking.tight, fontSize.h3) },
  lg: { fontSize: fontSize.lg, fontWeight: '600' },
  body: { fontSize: fontSize.body, fontWeight: '500', lineHeight: fontSize.body * 1.5 },
  sm: { fontSize: fontSize.sm, fontWeight: '500' },
  caption: { fontSize: fontSize.caption, fontWeight: '500' },
  overline: {
    fontSize: fontSize.overline,
    fontWeight: '700',
    letterSpacing: ls(tracking.overline, fontSize.overline),
    textTransform: 'uppercase',
  },
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  size?: number;
  weight?: number | TextStyle['fontWeight'];
  color?: string;
  align?: TextStyle['textAlign'];
  mono?: boolean;
}

export function Text({
  variant = 'body',
  size,
  weight,
  color = colors.textPrimary,
  align,
  mono,
  style,
  ...rest
}: TextProps) {
  const base = VARIANTS[variant];
  const rawWeight = weight ?? base.fontWeight;
  const finalWeight = (
    typeof rawWeight === 'number' ? String(rawWeight) : rawWeight
  ) as TextStyle['fontWeight'];
  const family = mono ? 'monospace' : familyForWeight(rawWeight as number | string);

  return (
    <RNText
      style={[
        base,
        {
          color,
          fontFamily: family,
          // RN applies fontWeight separately; keep it for platforms that synthesize.
          fontWeight: finalWeight,
        },
        // When size is overridden, scale the line height too — otherwise a
        // variant's fixed lineHeight (e.g. body's ~22px) clips larger text.
        size != null && { fontSize: size, lineHeight: Math.round(size * 1.25) },
        weight != null && { fontWeight: finalWeight },
        align != null && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
