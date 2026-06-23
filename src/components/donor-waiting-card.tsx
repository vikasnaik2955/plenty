/**
 * DonorWaitingCard — the engagement piece shown while a donor's request is in
 * the "requested" state, waiting for a nearby volunteer to accept.
 *
 * It keeps the donor motivated during the wait with a pulsing "radar" sweep, a
 * rotating carousel of impact facts, and a live countdown to the auto-cancel
 * (the store cancels the request with a default reason if nobody accepts in
 * time). Pure RN Animated (native driver) so it needs no extra worklet config.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, radius, shadows, space } from '@/theme';
import type { Category } from '@/data/types';

export interface DonorWaitingCardProps {
  category: Category;
  consumer: string;
  serves?: number;
  /** Epoch ms the request auto-cancels if still unaccepted. */
  expiresAt?: number;
}

const RING_COUNT = 3;
const RING_DURATION = 2200;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function DonorWaitingCard({ category, consumer, serves, expiresAt }: DonorWaitingCardProps) {
  const accent = category === 'food' ? colors.food : colors.clothes;
  const accentSoft = category === 'food' ? colors.foodSoft : colors.clothesSoft;

  // Motivating messages that rotate during the wait.
  const messages = useMemo(
    () => [
      `📡  Pinging volunteers within 5 km of you…`,
      `🍱  Your ${category === 'food' ? 'meal' : 'donation'} could brighten ${serves ? `${serves} ` : ''}someone's day.`,
      `💚  Most requests get picked up within minutes.`,
      `♻️  You're keeping good ${category === 'food' ? 'food' : 'clothes'} out of the bin.`,
      `⭐  Generous donors like you served 38+ people this week.`,
      `🙌  Hang tight — a volunteer is usually just around the corner.`,
    ],
    [category, serves],
  );

  // --- Radar sweep: staggered expanding rings ---------------------------------
  const rings = useRef(Array.from({ length: RING_COUNT }, () => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = rings.map((v) =>
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: RING_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    );
    const starts = rings.map((_, i) =>
      setTimeout(() => loops[i].start(), (i * RING_DURATION) / RING_COUNT),
    );
    return () => {
      starts.forEach(clearTimeout);
      loops.forEach((l) => l.stop());
    };
  }, [rings]);

  // --- Rotating message carousel ---------------------------------------------
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 2800);
    return () => clearInterval(id);
  }, [messages.length]);
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [index, fade]);

  // --- Live countdown to auto-cancel -----------------------------------------
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const remainingMs = expiresAt != null ? Math.max(0, expiresAt - now) : null;
  const totalRef = useRef<number | null>(null);
  if (totalRef.current == null && remainingMs != null && remainingMs > 0) {
    totalRef.current = remainingMs;
  }
  const frac =
    totalRef.current && remainingMs != null ? Math.max(0, Math.min(1, remainingMs / totalRef.current)) : 0;
  const remainingS = remainingMs != null ? Math.ceil(remainingMs / 1000) : null;
  const urgent = remainingS != null && remainingS <= 6;
  const barColor = urgent ? colors.warning : accent;

  return (
    <View style={styles.card}>
      {/* Radar */}
      <View style={styles.radar}>
        {rings.map((v, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                borderColor: accent,
                opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
                transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 2.7] }) }],
              },
            ]}
          />
        ))}
        <View style={[styles.core, { backgroundColor: accentSoft }]}>
          <Icon name="radar" size={28} color={accent} />
        </View>
      </View>

      <Text size={17} weight={800} color={colors.textPrimary} style={styles.center}>
        Finding a volunteer nearby…
      </Text>
      <Text size={13} color={colors.textMuted} style={[styles.center, { marginTop: 2 }]}>
        We&apos;re reaching volunteers near {consumer}.
      </Text>

      {/* Rotating engagement message */}
      <Animated.View
        style={[
          styles.messagePill,
          {
            opacity: fade,
            transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
          },
        ]}
      >
        <Text size={13} weight={600} color={colors.textSecondary} style={styles.center}>
          {messages[index]}
        </Text>
      </Animated.View>

      {/* Countdown to auto-cancel */}
      {remainingS != null && (
        <View style={styles.countdownWrap}>
          <View style={styles.countdownRow}>
            <Icon name="clock" size={14} color={urgent ? colors.warning : colors.textMuted} />
            <Text size={12} weight={700} color={urgent ? colors.warning : colors.textMuted}>
              {remainingS > 0
                ? `Auto-cancels in ${mmss(remainingS)} if no one accepts`
                : 'Wrapping up the search…'}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${frac * 100}%`, backgroundColor: barColor }]} />
          </View>
        </View>
      )}

      {/* Reassurance dots */}
      <View style={styles.dots}>
        {messages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? accent : colors.borderStrong, width: i === index ? 16 : 6 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: 20,
    paddingHorizontal: space[4],
    alignItems: 'center',
    marginTop: 12,
    ...shadows.sm,
  },
  center: { textAlign: 'center' },
  radar: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  core: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagePill: {
    marginTop: 14,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignSelf: 'stretch',
  },
  countdownWrap: { alignSelf: 'stretch', marginTop: 14, gap: 6 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSunken,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: radius.full },
  dots: { flexDirection: 'row', gap: 5, marginTop: 14, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
});
