/**
 * DonorHome — donor dashboard. Ported from DonorScreens.jsx `DonorHome`.
 * Bug-fix: the hero stat tiles read live counters (rewardPoints / peopleHelped)
 * from the store instead of the hardcoded 1,240 / 38 literals.
 */
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MessagesButton } from '@/components/messages-button';
import { NotificationsButton } from '@/components/notifications-button';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { DonationCard } from '@/components/ui/donation-card';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

const grp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function DonorHome() {
  const router = useRouter();
  const s = useApp();
  const t = useT();
  const p = s.profiles.donor;

  const recent = s.data.DONATIONS.filter((d) => ['completed', 'cancelled'].includes(d.status));
  // The donor's own live request (created this session) is the only "active"
  // request — no seeded/mock in-progress donations. Null once it completes.
  const liveAlloc = s.allocation && s.allocation.current !== 'completed' ? s.allocation : null;

  return (
    <Page
      nav={<RoleBottomNav role="donor" active="home" />}
      pad={false}
      header={
        <Hero
          eyebrow={t('donorHome.greeting')}
          title={p.name}
          right={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <MessagesButton />
              <NotificationsButton />
            </View>
          }
        >
          <View style={styles.statRow}>
            <View style={{ flex: 1 }}>
              <Text size={26} weight={800} color="#fff">
                {grp(s.rewardPoints)}
              </Text>
              <Text size={12} weight={600} color="#fff" style={{ opacity: 0.85 }}>
                {t('donorHome.rewardPoints')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={{ flex: 1 }}>
              <Text size={26} weight={800} color="#fff">
                {grp(s.peopleHelped)}
              </Text>
              <Text size={12} weight={600} color="#fff" style={{ opacity: 0.85 }}>
                {t('donorHome.peopleHelped')}
              </Text>
            </View>
          </View>
        </Hero>
      }
    >
      <View style={{ paddingHorizontal: space[5], paddingTop: space[4] }}>
        <PressableScale onPress={() => router.push('/(donor)/category')} style={styles.donateCard}>
          <View style={styles.donateIcon}>
            <Icon name="hand-heart" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text size={17} weight={800} color={colors.textPrimary}>
              {t('donorHome.donateTitle')}
            </Text>
            <Text size={13} color={colors.textSecondary}>
              {t('donorHome.donateSubtitle')}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(donor)/add-shelter')}
          style={[styles.donateCard, { marginTop: 12 }]}
        >
          <View style={[styles.donateIcon, styles.shelterIcon]}>
            <Icon name="building-2" size={24} color={colors.clothes} />
          </View>
          <View style={{ flex: 1 }}>
            <Text size={17} weight={800} color={colors.textPrimary}>
              {t('donorHome.addShelterTitle')}
            </Text>
            <Text size={13} color={colors.textSecondary}>
              {t('donorHome.addShelterSubtitle')}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </PressableScale>

        <SectionHeader title={t('donorHome.activeRequests')} />
        <View style={{ gap: 10 }}>
          {liveAlloc ? (
            <DonationCard
              category={liveAlloc.category}
              title={liveAlloc.title}
              status={liveAlloc.current}
              time={t('donorHome.toRecipient', { name: liveAlloc.consumer })}
              onPress={() => router.push('/(donor)/track')}
              meta={[
                { icon: 'users', label: liveAlloc.serves ? t('donorHome.serves', { count: liveAlloc.serves }) : (liveAlloc.pieces ?? '') },
                { icon: 'map-pin', label: t('donorHome.km', { distance: liveAlloc.distance }) },
              ]}
            />
          ) : (
            <Text size={13} color={colors.textMuted}>
              {t('donorHome.noActiveRequests')}
            </Text>
          )}
        </View>

        <SectionHeader
          title={t('donorHome.recentHistory')}
          action={t('common.seeAll')}
          onAction={() => router.push('/(donor)/history')}
        />
        <View style={{ gap: 10 }}>
          {recent.slice(0, 2).map((d) => (
            <DonationCard
              key={d.id}
              category={d.category}
              title={d.title}
              status={d.status}
              time={d.time}
              meta={[{ icon: 'users', label: d.serves ? t('donorHome.serves', { count: d.serves }) : (d.pieces ?? '') }]}
              onPress={() => router.push({ pathname: '/delivery', params: { id: d.id } })}
            />
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: space[4],
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: space[4],
  },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  donateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: space[4],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  donateIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brand,
  },
  shelterIcon: {
    backgroundColor: colors.clothesSoft,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
