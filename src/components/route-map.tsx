/**
 * RouteMap — an embedded Google map showing the task points (pickup / volunteer
 * / transport / drop-off) with a connecting route. Falls back to the static
 * CSS map (MapPlaceholder) when no API key is configured or when the native
 * map module isn't available (e.g. Expo Go), so the UI always renders.
 */
import { Component, type ReactNode } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { MapPlaceholder, type MapPin } from '@/components/ui/map-placeholder';
import { canUseNativeMaps } from '@/config/maps';
import { colors, palette, radius } from '@/theme';
import type { Geo } from '@/utils/contact';

export type PointKind = 'pickup' | 'dropoff' | 'volunteer' | 'transport' | 'you';

export interface TrackPoint {
  id: string;
  geo: Geo;
  kind: PointKind;
  label?: string;
}

const KIND_COLOR: Record<PointKind, string> = {
  pickup: colors.food,
  dropoff: colors.clothes,
  volunteer: colors.brand,
  transport: palette.violet500,
  you: colors.brandStrong,
};

// Order used to draw the route line through whatever points are present.
const ROUTE_ORDER: PointKind[] = ['pickup', 'transport', 'volunteer', 'dropoff'];

function regionFor(points: TrackPoint[]) {
  const lats = points.map((p) => p.geo.lat);
  const lngs = points.map((p) => p.geo.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.6),
  };
}

/** Convert geo points to 0–100 % positions for the static fallback map. */
function toPins(points: TrackPoint[]): MapPin[] {
  const lats = points.map((p) => p.geo.lat);
  const lngs = points.map((p) => p.geo.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  return points.map((p) => ({
    x: 12 + ((p.geo.lng - minLng) / spanLng) * 76,
    y: 80 - ((p.geo.lat - minLat) / spanLat) * 60,
    label: p.label,
    accent: KIND_COLOR[p.kind],
    you: p.kind === 'you' || p.kind === 'volunteer',
  }));
}

function StaticMap({ points, height }: { points: TrackPoint[]; height: number }) {
  return <MapPlaceholder height={height} pins={toPins(points)} radiusLabel="route" />;
}

class MapErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function RouteMap({
  points,
  height = 220,
  route = true,
  fill = false,
}: {
  points: TrackPoint[];
  height?: number;
  route?: boolean;
  /** Fill the parent (flex:1) instead of a fixed height — for full-screen maps. */
  fill?: boolean;
}) {
  if (points.length === 0) return null;

  const fallback = <StaticMap points={points} height={fill ? 320 : height} />;

  // Without a real key, or in Expo Go (no native maps module), show the static
  // map directly so the area is never blank.
  if (!canUseNativeMaps) return fallback;

  const routeCoords = ROUTE_ORDER.map((k) => points.find((p) => p.kind === k))
    .filter((p): p is TrackPoint => !!p)
    .map((p) => ({ latitude: p.geo.lat, longitude: p.geo.lng }));

  return (
    <MapErrorBoundary fallback={fallback}>
      <View style={fill ? { flex: 1 } : { height, borderRadius: radius.lg, overflow: 'hidden' }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={regionFor(points)}
          showsUserLocation
          toolbarEnabled={false}
          scrollEnabled
          zoomEnabled
          rotateEnabled
          pitchEnabled
          zoomControlEnabled
          zoomTapEnabled
          loadingEnabled
        >
          {points.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.geo.lat, longitude: p.geo.lng }}
              title={p.label}
              pinColor={KIND_COLOR[p.kind]}
            />
          ))}
          {route && routeCoords.length >= 2 && (
            <Polyline coordinates={routeCoords} strokeColor={colors.brand} strokeWidth={4} />
          )}
        </MapView>
      </View>
    </MapErrorBoundary>
  );
}
