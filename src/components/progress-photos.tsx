/**
 * ProgressPhotos — read-only grid of delivery evidence photos, each labelled
 * with the lifecycle step it was taken at and the time it was uploaded. Shared
 * by donor / volunteer / transport / admin views so everyone sees the same
 * progress with timestamps.
 */
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { STATUS_LABEL, colors, radius } from '@/theme';
import { formatStamp } from '@/utils/datetime';
import type { ProofPhotos } from '@/data/types';

// Show steps in lifecycle order.
const ORDER = ['accepted', 'picked_up', 'delivered', 'completed'];

export function ProgressPhotos({ proofs }: { proofs?: ProofPhotos }) {
  const keys = proofs
    ? ORDER.filter((k) => proofs[k]).concat(Object.keys(proofs).filter((k) => !ORDER.includes(k)))
    : [];

  if (keys.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="sm" color={colors.textMuted} align="center">
          No progress photos yet. The volunteer adds a photo at each step.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {keys.map((k) => {
        const p = proofs![k];
        return (
          <View key={k} style={styles.item}>
            <View style={styles.thumbWrap}>
              <Image source={{ uri: p.uri }} contentFit="cover" style={styles.thumb} />
              <View style={styles.check}>
                <Icon name="check" size={12} color="#fff" />
              </View>
            </View>
            <Text size={11} weight={700} color={colors.textSecondary} align="center" style={{ marginTop: 5 }}>
              {STATUS_LABEL[k] ?? k.replace('_', ' ')}
            </Text>
            <Text size={10} color={colors.textMuted} align="center">
              {formatStamp(p.at)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: 96 },
  thumbWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    aspectRatio: 1,
    backgroundColor: colors.surfaceSunken,
  },
  thumb: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { padding: 14, backgroundColor: colors.surfaceSunken, borderRadius: radius.md },
});
