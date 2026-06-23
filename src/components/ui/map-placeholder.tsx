/**
 * MapPlaceholder — offline, View-only map placeholder with a dashed radius ring
 * and pins. No tiles/images. Pins: [{x,y,accent,label,you}] with x/y as 0–100
 * percentages of the frame. Ported from `components/feedback/MapPlaceholder.jsx`.
 */
import { type DimensionValue, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface MapPin {
  /** Horizontal position, 0–100 (% of frame). */
  x: number;
  /** Vertical position, 0–100 (% of frame). */
  y: number;
  /** Pin color (defaults to Food orange). */
  accent?: string;
  label?: string;
  /** Render as the "you are here" brand pin. */
  you?: boolean;
}

export interface MapPlaceholderProps {
  pins?: MapPin[];
  /** Radius ring caption. @default "10 km" */
  radiusLabel?: string;
  /** Frame height in px. @default 220 */
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function MapPlaceholder({ pins = [], radiusLabel = '10 km', height = 220, style }: MapPlaceholderProps) {
  return (
    <View
      style={[
        {
          position: 'relative',
          width: '100%',
          height,
          overflow: 'hidden',
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          backgroundColor: '#E6EDE6',
        },
        style,
      ]}
    >
      {/* a couple of faint "roads" */}
      <View
        style={{
          position: 'absolute',
          left: '38%',
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '46%',
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      />

      {/* radius ring centered on "you" */}
      <View
        style={{
          position: 'absolute',
          left: '11%',
          top: height * 0.5 - height * 0.39,
          width: '78%',
          height: height * 0.78,
          borderRadius: 999,
          backgroundColor: 'rgba(31,157,87,0.10)',
          borderWidth: 2,
          borderColor: 'rgba(31,157,87,0.45)',
          borderStyle: 'dashed',
        }}
      />

      {/* radius label pill */}
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: height * 0.5 - height * 0.39 - 10,
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={[
            {
              backgroundColor: colors.surfaceCard,
              paddingVertical: 2,
              paddingHorizontal: 8,
              borderRadius: radius.full,
            },
            shadows.sm,
          ]}
        >
          <Text size={11} weight={800} color={colors.brandStrong}>
            {radiusLabel} radius
          </Text>
        </View>
      </View>

      {/* your location dot */}
      <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -9, marginTop: -9 }}>
        <View
          style={[
            {
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: colors.brand,
              borderWidth: 3,
              borderColor: '#fff',
            },
            shadows.md,
          ]}
        />
      </View>

      {/* recipient / item pins */}
      {pins.map((p, i) => {
        const color = p.you ? colors.brand : p.accent || colors.food;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%` as DimensionValue,
              top: `${p.y}%` as DimensionValue,
              transform: [{ translateX: -15 }, { translateY: -30 }],
              alignItems: 'center',
            }}
          >
            <Icon name="map-pin" size={30} strokeWidth={2.5} color={color} />
            {p.label && (
              <View
                style={[
                  {
                    marginTop: -4,
                    backgroundColor: colors.surfaceCard,
                    paddingVertical: 1,
                    paddingHorizontal: 6,
                    borderRadius: radius.full,
                  },
                  shadows.xs,
                ]}
              >
                <Text size={10} weight={800} color={colors.textPrimary}>
                  {p.label}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
