/**
 * TrackPanel — shared "track the current task" view used by every role. Shows
 * the route map (pickup → volunteer/transport → drop-off) with a legend and a
 * "Get directions" button that opens Google Maps. Points are resolved by name
 * via the geo config until a backend supplies real coordinates.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { RouteMap, type PointKind, type TrackPoint } from '@/components/route-map';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { geoForName } from '@/config/geo';
import { colors, palette, radius, space } from '@/theme';
import { openDirections } from '@/utils/contact';

interface Party {
  name: string;
}

const KIND_COLOR: Record<PointKind, string> = {
  pickup: colors.food,
  dropoff: colors.clothes,
  volunteer: colors.brand,
  transport: palette.violet500,
  you: colors.brandStrong,
};

export function TrackPanel({
  pickup,
  dropoff,
  volunteer,
  transport,
  height = 200,
  onExpand,
}: {
  pickup: Party;
  dropoff: Party;
  volunteer?: Party;
  transport?: { label: string };
  height?: number;
  /** When set, shows a "Full map" button that opens the full-screen map. */
  onExpand?: () => void;
}) {
  const points: TrackPoint[] = [
    { id: 'pickup', kind: 'pickup', geo: geoForName(pickup.name), label: `Pickup · ${pickup.name}` },
    { id: 'dropoff', kind: 'dropoff', geo: geoForName(dropoff.name), label: `Drop-off · ${dropoff.name}` },
  ];
  if (volunteer) {
    points.push({
      id: 'volunteer',
      kind: 'volunteer',
      geo: geoForName(volunteer.name),
      label: `Volunteer · ${volunteer.name}`,
    });
  }
  if (transport) {
    points.push({
      id: 'transport',
      kind: 'transport',
      geo: geoForName(transport.label),
      label: `Transport · ${transport.label}`,
    });
  }

  const legend: { kind: PointKind; label: string }[] = [
    { kind: 'pickup', label: `Pickup · ${pickup.name}` },
    ...(volunteer ? [{ kind: 'volunteer' as PointKind, label: `Volunteer · ${volunteer.name}` }] : []),
    ...(transport ? [{ kind: 'transport' as PointKind, label: `Transport · ${transport.label}` }] : []),
    { kind: 'dropoff', label: `Drop-off · ${dropoff.name}` },
  ];

  return (
    <View style={styles.card}>
      <RouteMap points={points} height={height} />
      <View style={styles.legend}>
        {legend.map((l) => (
          <View key={l.kind} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: KIND_COLOR[l.kind] }]} />
            <Text size={12} weight={600} color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
              {l.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        {onExpand && (
          <Pressable
            onPress={onExpand}
            accessibilityRole="button"
            accessibilityLabel="Open full map"
            style={styles.fullMap}
          >
            <Icon name="maximize-2" size={16} color={colors.brandStrong} />
            <Text variant="body" weight={700} color={colors.brandStrong}>
              Full map
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => openDirections(geoForName(dropoff.name), geoForName(pickup.name))}
          accessibilityRole="button"
          accessibilityLabel="Get directions in Google Maps"
          style={styles.directions}
        >
          <Icon name="navigation" size={16} color="#fff" />
          <Text variant="body" weight={700} color="#fff">
            Get directions
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[3] },
  legend: { gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  directions: {
    flex: 1,
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  fullMap: {
    flex: 1,
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
});

