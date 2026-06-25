/**
 * DonorRewards — gold rewards hero, stat tiles, and points ledger.
 * Ported from DonorScreens2.jsx `DonorRewards`. The big number reads the live
 * rewardPoints counter from the store.
 */
import { View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, palette, radius, shadows, space } from '@/theme';

const grp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Static demo ledger. `reasonKey`/`timeKey` are translated at render time.
const LEDGER = [
  { reasonKey: 'donorRewards.ledgerJackets', pts: 60, timeKey: 'donorRewards.timeYesterday' },
  { reasonKey: 'donorRewards.ledgerRiceDal', pts: 90, timeKey: 'donorRewards.timeTwoDays' },
  { reasonKey: 'donorRewards.ledgerCookedMeals', pts: 45, timeKey: 'donorRewards.timeFiveDays' },
  { reasonKey: 'donorRewards.ledgerFirstBonus', pts: 100, timeKey: 'donorRewards.timeLastMonth' },
];

export default function DonorRewards() {
  const t = useT();
  const s = useApp();

  return (
    <Page
      nav={<RoleBottomNav role="donor" active="rewards" />}
      pad={false}
      header={
        <Hero
          accent={palette.gold400}
          accent2={palette.gold600}
          eyebrow={t('donorRewards.eyebrow')}
          title={t('donorRewards.title')}
          right={
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="trophy" size={24} color="#fff" />
            </View>
          }
        >
          <View style={{ marginTop: 18 }}>
            <Text size={40} weight={800} color="#fff" style={{ lineHeight: 40 }}>
              {grp(s.rewardPoints)}
            </Text>
            <Text size={13} weight={600} color="#fff" style={{ opacity: 0.9, marginTop: 4 }}>
              {t('donorRewards.pointsToPlatinum')}
            </Text>
            <View style={styles.barTrack}>
              <View style={styles.barFill} />
            </View>
          </View>
        </Hero>
      }
    >
      <View style={{ paddingHorizontal: space[5], paddingTop: space[4], flexDirection: 'row', gap: 12 }}>
        <StatCard value="38" label={t('donorRewards.statDonations')} accent="reward" icon={<Icon name="gift" />} />
        <StatCard value="12" label={t('donorRewards.statThisMonth')} accent="brand" icon={<Icon name="calendar" />} trend="+4" />
      </View>
      <View style={{ paddingHorizontal: space[5] }}>
        <SectionHeader title={t('donorRewards.pointsHistory')} />
        <View style={styles.ledger}>
          {LEDGER.map((l, i) => (
            <View
              key={i}
              style={[
                styles.ledgerRow,
                i < LEDGER.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.ledgerIcon}>
                <Icon name="award" size={18} color={palette.gold600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text size={14} weight={700} color={colors.textPrimary}>
                  {t(l.reasonKey)}
                </Text>
                <Text size={12} color={colors.textMuted}>
                  {t(l.timeKey)}
                </Text>
              </View>
              <Text size={15} weight={800} color={palette.gold600}>
                +{l.pts}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = {
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    overflow: 'hidden' as const,
  },
  barFill: { width: '82%' as const, height: '100%' as const, backgroundColor: '#fff', borderRadius: 4 },
  ledger: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
  },
  ledgerRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 13 },
  ledgerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.rewardSoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
