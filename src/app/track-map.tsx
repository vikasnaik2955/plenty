/**
 * Track Map — full-screen, movable/zoomable map shared by every role. The map
 * fills the screen (so pan / pinch-zoom / zoom buttons all work freely, unlike
 * a map embedded in a scroll view), with a details panel pinned at the bottom.
 * Opened with `/track-map?title=…&pickup=…&dropoff=…&volunteer=…`.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteMap, type PointKind, type TrackPoint } from '@/components/route-map';
import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { geoForName } from '@/config/geo';
import { colors, palette, radius, shadows, space } from '@/theme';
import { openDirections } from '@/utils/contact';
import type { Status } from '@/data/types';

const LIFECYCLE: Status[] = ['requested', 'accepted', 'picked_up', 'delivered', 'completed', 'cancelled'];

const KIND_COLOR: Record<PointKind, string> = {
  pickup: colors.food,
  dropoff: colors.clothes,
  volunteer: colors.brand,
  transport: palette.violet500,
  you: colors.brandStrong,
};

export default function TrackMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<{
    title?: string;
    pickup?: string;
    dropoff?: string;
    volunteer?: string;
    transport?: string;
    status?: string;
  }>();

  const pickup = p.pickup || 'Donor';
  const dropoff = p.dropoff || 'Recipient';
  const status = LIFECYCLE.includes(p.status as Status) ? (p.status as Status) : undefined;

  const points: TrackPoint[] = [
    { id: 'pickup', kind: 'pickup', geo: geoForName(pickup), label: `Pickup · ${pickup}` },
    { id: 'dropoff', kind: 'dropoff', geo: geoForName(dropoff), label: `Drop-off · ${dropoff}` },
  ];
  if (p.volunteer) {
    points.push({ id: 'volunteer', kind: 'volunteer', geo: geoForName(p.volunteer), label: `Volunteer · ${p.volunteer}` });
  }
  if (p.transport) {
    points.push({ id: 'transport', kind: 'transport', geo: geoForName(p.transport), label: `Transport · ${p.transport}` });
  }

  const legend: { kind: PointKind; label: string }[] = [
    { kind: 'pickup', label: pickup },
    ...(p.volunteer ? [{ kind: 'volunteer' as PointKind, label: p.volunteer }] : []),
    ...(p.transport ? [{ kind: 'transport' as PointKind, label: p.transport }] : []),
    { kind: 'dropoff', label: dropoff },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfacePage }}>
      <AppBar title={p.title || 'Track delivery'} onBack={() => router.back()} />

      <View style={{ flex: 1 }}>
        <RouteMap points={points} fill />
      </View>

      <View style={[styles.panel, { paddingBottom: space[4] + insets.bottom }]}>
        {status && (
          <View style={styles.statusRow}>
            <Text variant="sm" weight={700}>
              Current delivery
            </Text>
            <StatusBadge status={status} size="sm" />
          </View>
        )}
        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.kind} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: KIND_COLOR[l.kind] }]} />
              <Text size={12} weight={600} color={colors.textSecondary} numberOfLines={1}>
                {l.label}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => openDirections(geoForName(dropoff), geoForName(pickup))}
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
  panel: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: space[5],
    paddingTop: space[4],
    gap: space[3],
    ...shadows.lg,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space[4], rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  directions: {
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
});
