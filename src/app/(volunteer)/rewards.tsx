/**
 * VolRewards — the volunteer rewards tab. Gold hero with tier + progress, a
 * weekly-streak strip, stat tiles, the next-badge nudge, an achievements grid,
 * a redeemable perks store, and the points-history ledger. All values are live
 * from the store's `volRewards` slice (see src/config/rewards.ts for the rules).
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import {
  BADGES,
  PERKS,
  POINT_RULES,
  nextBadge,
  nextTier,
  redeemBlock,
  tierForPoints,
  tierProgress,
  VOL_TIERS,
  type Badge,
  type Perk,
} from '@/config/rewards';
import { useT } from '@/i18n/use-t';
import { colors, palette, radius, shadows, space } from '@/theme';
import { formatRelative } from '@/utils/datetime';

const grp = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function VolRewards() {
  const t = useT();
  const s = useApp();
  const r = s.volRewards;

  const tier = tierForPoints(r.lifetimePoints);
  const tierName = t(`rewards.tier.${tier.id}`);
  const next = nextTier(r.lifetimePoints);
  const nextName = next ? t(`rewards.tier.${next.id}`) : '';
  const progress = tierProgress(r.lifetimePoints);
  const toNext = next ? next.minPoints - r.lifetimePoints : 0;
  const nb = nextBadge(r);
  const earned = new Set(r.badges);

  const qualifying = r.deliveriesThisWeek >= 2;
  const milestoneLeft =
    r.weeklyStreak < 4
      ? t('volRewards.milestoneToFirst', { weeks: 4 - r.weeklyStreak })
      : r.weeklyStreak < 12
        ? t('volRewards.milestoneToSecond', { weeks: 12 - r.weeklyStreak })
        : t('volRewards.maxStreak');

  const [badge, setBadge] = useState<Badge | null>(null);

  return (
    <Page
      nav={<RoleBottomNav role="volunteer" active="rewards" />}
      pad={false}
      header={
        <Hero
          accent={palette.gold400}
          accent2={palette.gold600}
          eyebrow={t('volRewards.eyebrow')}
          title={t('volRewards.heroTitle', { tier: tierName })}
          right={
            <View style={styles.heroBadge}>
              <Icon name={tier.icon} size={24} color="#fff" />
            </View>
          }
        >
          <View style={{ marginTop: 18 }}>
            <Text size={40} weight={800} color="#fff" style={{ lineHeight: 40 }}>
              {grp(r.balance)}
            </Text>
            <Text size={13} weight={600} color="#fff" style={{ opacity: 0.9, marginTop: 4 }}>
              {t('volRewards.pointsToSpend')} ·{' '}
              {next
                ? t('volRewards.toNextTier', { points: grp(toNext), tier: nextName })
                : t('volRewards.topTierReached')}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text size={11} weight={600} color="#fff" style={{ opacity: 0.85, marginTop: 6 }}>
              {t('volRewards.lifetimePoints', { points: grp(r.lifetimePoints) })}
            </Text>
          </View>
        </Hero>
      }
    >
      {/* Streak strip */}
      <View style={{ paddingHorizontal: space[5], paddingTop: space[4] }}>
        <View style={styles.streakCard}>
          <View style={styles.flameWrap}>
            <Icon name="flame" size={26} color={palette.orange500} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text size={16} weight={800} color={colors.textPrimary}>
              {t('volRewards.weekStreak', { count: r.weeklyStreak })}
            </Text>
            <Text size={12} weight={600} color={colors.textMuted}>
              {qualifying ? t('volRewards.multiplierActive') : t('volRewards.unlockMultiplier')} ·{' '}
              {milestoneLeft}
            </Text>
          </View>
          <View style={styles.weekRing}>
            <Text size={13} weight={800} color={qualifying ? colors.brandStrong : colors.textSecondary}>
              {Math.min(r.deliveriesThisWeek, 2)}/2
            </Text>
            <Text size={10} weight={600} color={colors.textMuted}>
              {t('volRewards.thisWk')}
            </Text>
          </View>
        </View>
        {r.graceQuarterUsed == null && (
          <View style={styles.graceRow}>
            <Icon name="shield-check" size={13} color={colors.brandStrong} />
            <Text size={11} weight={600} color={colors.textSecondary}>
              {t('volRewards.graceWeek')}
            </Text>
          </View>
        )}
      </View>

      {/* Stat tiles */}
      <View style={styles.statRow}>
        <StatCard
          value={grp(r.deliveriesCompleted)}
          label={t('volRewards.statDeliveries')}
          accent="brand"
          icon={<Icon name="truck" size={20} color={colors.brandStrong} />}
        />
        <StatCard
          value={grp(r.peopleFed)}
          label={t('volRewards.statPeopleFed')}
          accent="reward"
          icon={<Icon name="heart" size={20} color={palette.gold600} />}
        />
      </View>

      {/* Next badge nudge */}
      {nb && (
        <View style={{ paddingHorizontal: space[5] }}>
          <View style={styles.nudge}>
            <View style={styles.nudgeIcon}>
              <Icon name={nb.badge.icon} size={22} color={palette.gold600} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size={14} weight={700} color={colors.textPrimary}>
                {t('volRewards.nextBadge', { name: t(`rewards.badge.${nb.badge.id}.name`) })}
              </Text>
              <Text size={12} color={colors.textMuted} style={{ marginBottom: 6 }}>
                {grp(nb.current)} / {t(`rewards.badge.${nb.badge.id}.goal`)}
              </Text>
              <View style={styles.nudgeTrack}>
                <View style={[styles.nudgeFill, { width: `${Math.round(nb.ratio * 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Badges grid */}
      <View style={{ paddingHorizontal: space[5] }}>
        <SectionHeader
          title={t('volRewards.badgesCount', { earned: r.badges.length, total: BADGES.length })}
        />
        <View style={styles.badgeGrid}>
          {BADGES.map((b) => {
            const on = earned.has(b.id);
            const bName = t(`rewards.badge.${b.id}.name`);
            return (
              <Pressable
                key={b.id}
                onPress={() => setBadge(b)}
                accessibilityRole="button"
                accessibilityLabel={
                  on
                    ? t('volRewards.badgeEarnedLabel', { name: bName })
                    : t('volRewards.badgeLockedLabel', { name: bName })
                }
                style={styles.badgeCell}
              >
                <View style={[styles.badgeIcon, on ? styles.badgeIconOn : styles.badgeIconOff]}>
                  <Icon name={on ? b.icon : 'lock'} size={22} color={on ? palette.gold600 : colors.textMuted} />
                </View>
                <Text
                  size={11}
                  weight={700}
                  color={on ? colors.textPrimary : colors.textMuted}
                  align="center"
                  numberOfLines={1}
                >
                  {bName}
                </Text>
                <Text size={10} color={colors.textMuted} align="center" numberOfLines={1}>
                  {on ? t('volRewards.earned') : t(`rewards.badge.${b.id}.goal`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Perks store */}
      <View style={{ paddingHorizontal: space[5] }}>
        <SectionHeader title={t('volRewards.storeTitle')} />
        <Text variant="caption" color={colors.textSecondary} style={{ marginTop: -4, marginBottom: 10 }}>
          {t('volRewards.storeSubtitle')}
        </Text>
        <View style={{ gap: 10 }}>
          {PERKS.map((p) => (
            <PerkRow key={p.id} perk={p} onRedeem={() => s.redeemPerk(p)} />
          ))}
        </View>
      </View>

      {/* Ledger */}
      <View style={{ paddingHorizontal: space[5] }}>
        <SectionHeader title={t('volRewards.pointsHistory')} />
        <View style={styles.ledger}>
          {r.ledger.slice(0, 12).map((l, i) => {
            const redeem = l.kind === 'redeem';
            return (
              <View
                key={l.id}
                style={[styles.ledgerRow, i < Math.min(r.ledger.length, 12) - 1 && styles.ledgerDivider]}
              >
                <View style={[styles.ledgerIcon, redeem && { backgroundColor: colors.surfaceSunken }]}>
                  <Icon
                    name={redeem ? 'gift' : l.kind === 'bonus' ? 'flame' : 'award'}
                    size={18}
                    color={redeem ? colors.textSecondary : palette.gold600}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text size={14} weight={700} color={colors.textPrimary} numberOfLines={1}>
                    {l.reason}
                  </Text>
                  <Text size={12} color={colors.textMuted}>
                    {formatRelative(l.at)}
                  </Text>
                </View>
                <Text size={15} weight={800} color={redeem ? colors.textSecondary : palette.gold600}>
                  {l.delta > 0 ? `+${grp(l.delta)}` : grp(l.delta)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* How points work */}
      <View style={{ paddingHorizontal: space[5], paddingBottom: space[4] }}>
        <SectionHeader title={t('volRewards.howToEarn')} />
        <View style={styles.rulesCard}>
          {POINT_RULES.map((rule, i) => (
            <View key={rule.id} style={[styles.ruleRow, i < POINT_RULES.length - 1 && styles.ledgerDivider]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text size={13} weight={700} color={colors.textPrimary}>
                  {t(`rewards.rule.${rule.id}.action`)}
                </Text>
                <Text size={11} color={colors.textMuted}>
                  {t(`rewards.rule.${rule.id}.note`)}
                </Text>
              </View>
              <Text size={13} weight={800} color={palette.gold600}>
                {rule.points}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Badge detail sheet */}
      <BottomSheet
        open={!!badge}
        title={badge ? t(`rewards.badge.${badge.id}.name`) : ''}
        onClose={() => setBadge(null)}
      >
        {badge && (
          <View style={{ alignItems: 'center', gap: 12, paddingBottom: space[2] }}>
            <View
              style={[
                styles.badgeIcon,
                { width: 72, height: 72, borderRadius: 36 },
                earned.has(badge.id) ? styles.badgeIconOn : styles.badgeIconOff,
              ]}
            >
              <Icon
                name={earned.has(badge.id) ? badge.icon : 'lock'}
                size={32}
                color={earned.has(badge.id) ? palette.gold600 : colors.textMuted}
              />
            </View>
            <Text size={15} weight={600} color={colors.textSecondary} align="center">
              {t(`rewards.badge.${badge.id}.flavor`)}
            </Text>
            <View style={styles.badgeGoalPill}>
              <Icon
                name={earned.has(badge.id) ? 'check' : 'target'}
                size={14}
                color={earned.has(badge.id) ? colors.brandStrong : colors.textSecondary}
              />
              <Text
                size={12}
                weight={700}
                color={earned.has(badge.id) ? colors.brandStrong : colors.textSecondary}
              >
                {earned.has(badge.id)
                  ? t('volRewards.earned')
                  : t('volRewards.goalPill', { goal: t(`rewards.badge.${badge.id}.goal`) })}
              </Text>
            </View>
          </View>
        )}
      </BottomSheet>
    </Page>
  );
}

function PerkRow({ perk, onRedeem }: { perk: Perk; onRedeem: () => void }) {
  const t = useT();
  const s = useApp();
  const block = redeemBlock(perk, s.volRewards, s.volRewards.lifetimePoints);
  const redeemed = block === 'redeemed';
  const locked = block === 'tier';
  const poor = block === 'points';
  const ok = block == null;

  const perkName = t(`rewards.perk.${perk.id}.name`);

  return (
    <View style={styles.perkCard}>
      <View style={[styles.perkIcon, ok ? { backgroundColor: colors.rewardSoft } : { backgroundColor: colors.surfaceSunken }]}>
        <Icon name={perk.icon} size={22} color={ok ? palette.gold600 : colors.textMuted} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text size={14} weight={700} color={colors.textPrimary}>
          {perkName}
        </Text>
        <Text size={12} color={colors.textMuted} numberOfLines={2}>
          {t(`rewards.perk.${perk.id}.desc`)}
        </Text>
        <Text size={12} weight={800} color={palette.gold600} style={{ marginTop: 3 }}>
          {t('volRewards.perkPts', { points: grp(perk.costPoints) })}
        </Text>
      </View>
      <Pressable
        onPress={ok ? onRedeem : undefined}
        disabled={!ok}
        accessibilityRole="button"
        accessibilityLabel={t('volRewards.redeemName', { name: perkName })}
        style={[
          styles.redeemBtn,
          ok ? { backgroundColor: colors.brand } : { backgroundColor: colors.surfaceSunken },
        ]}
      >
        <Text size={13} weight={700} color={ok ? '#fff' : colors.textMuted}>
          {redeemed
            ? t('volRewards.redeemed')
            : locked
              ? t('volRewards.lockedTier', { tier: t(`rewards.tier.${VOL_TIERS[perk.minTierIndex].id}`) })
              : poor
                ? t('volRewards.needMore')
                : t('volRewards.redeem')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  flameWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 2 },
  statRow: {
    flexDirection: 'row',
    gap: space[3],
    paddingTop: space[4],
    paddingHorizontal: space[5],
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: space[4],
    backgroundColor: colors.rewardSoft,
    borderWidth: 1,
    borderColor: palette.gold300,
    borderRadius: radius.lg,
    padding: 14,
  },
  nudgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeTrack: { height: 6, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  nudgeFill: { height: 6, borderRadius: radius.full, backgroundColor: palette.gold500 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, columnGap: 0 },
  badgeCell: { width: '33.333%', alignItems: 'center', gap: 5, paddingHorizontal: 4 },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  badgeIconOn: { backgroundColor: colors.rewardSoft, borderWidth: 1.5, borderColor: palette.gold300 },
  badgeIconOff: { backgroundColor: colors.surfaceSunken, borderWidth: 1.5, borderColor: colors.borderSubtle },
  badgeGoalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSunken,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 12,
    ...shadows.sm,
  },
  perkIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  redeemBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  ledger: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
  },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  ledgerDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  ledgerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.rewardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
});
