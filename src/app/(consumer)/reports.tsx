/**
 * Consumer Reports — recipient impact dashboard. Ported from ConsumerScreens.jsx
 * `ConReports`. Period tabs (monthly/yearly) switch the stats and bar chart.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { colors, palette, radius, shadows } from '@/theme';

const MONTH_BARS = [
  { l: 'W1', v: 60 },
  { l: 'W2', v: 80 },
  { l: 'W3', v: 45 },
  { l: 'W4', v: 95 },
];
const YEAR_BARS = [
  { l: 'Q1', v: 55 },
  { l: 'Q2', v: 70 },
  { l: 'Q3', v: 90 },
  { l: 'Q4', v: 100 },
];
const MAX = 100;

export default function ConReports() {
  const t = useT();
  const [period, setPeriod] = useState('month');
  const isMonth = period === 'month';
  const bars = isMonth ? MONTH_BARS : YEAR_BARS;

  return (
    <Page
      nav={<RoleBottomNav role="consumer" active="reports" />}
      header={<AppBar title={t('conReports.title')} align="center" />}
    >
      <Tabs
        active={period}
        onChange={setPeriod}
        items={[
          { key: 'month', label: t('conReports.monthly') },
          { key: 'year', label: t('conReports.yearly') },
        ]}
        style={{ marginBottom: 16 }}
      />

      <View style={styles.stats}>
        <StatCard value={isMonth ? '214' : '2,480'} label={t('conReports.mealsReceived')} accent="food" trend="+12%" icon={<Icon name="utensils" size={20} color={palette.orange600} />} />
        <StatCard value={isMonth ? '86' : '910'} label={t('conReports.itemsReceived')} accent="clothes" trend="+8%" icon={<Icon name="shirt" size={20} color={palette.teal600} />} />
      </View>

      <View style={styles.chartCard}>
        <Text size={14} weight={800} color={colors.textPrimary} style={{ marginBottom: 16 }}>
          {t('conReports.donationsReceived')}
        </Text>
        <View style={styles.chartRow}>
          {bars.map((b, i) => (
            <View key={b.l} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(b.v / MAX) * 100}%`,
                    backgroundColor: i === bars.length - 1 ? colors.brand : palette.green200,
                  },
                ]}
              />
              <Text size={11} weight={700} color={colors.textMuted}>
                {b.l}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.insight}>
        <View style={styles.insightIcon}>
          <Icon name="trending-up" size={20} color="#fff" />
        </View>
        <Text size={13} weight={600} color={palette.green800} style={{ flex: 1 }}>
          {isMonth
            ? t('conReports.insightMonth', { count: '300' })
            : t('conReports.insightYear', { count: '3,390' })}
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  chartCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 12,
    ...shadows.sm,
  },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, height: 130 },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  bar: {
    width: '100%',
    maxWidth: 38,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  insight: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
