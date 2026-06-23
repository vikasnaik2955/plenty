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
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

const grp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function DonorHome() {
  const router = useRouter();
  const s = useApp();
  const p = s.profiles.donor;

  const active = s.data.DONATIONS.filter((d) =>
    ['requested', 'accepted', 'picked_up'].includes(d.status),
  );
  const recent = s.data.DONATIONS.filter((d) => ['completed', 'cancelled'].includes(d.status));
  // The donor's own live request (created this session), surfaced so they can
  // jump back to tracking it; null once it has completed.
  const liveAlloc = s.allocation && s.allocation.current !== 'completed' ? s.allocation : null;

  return (
    <Page
      nav={<RoleBottomNav role="donor" active="home" />}
      pad={false}
      header={
        <Hero
          eyebrow="Good evening"
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
                Reward points
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={{ flex: 1 }}>
              <Text size={26} weight={800} color="#fff">
                {grp(s.peopleHelped)}
              </Text>
              <Text size={12} weight={600} color="#fff" style={{ opacity: 0.85 }}>
                People helped
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
              Donate something
            </Text>
            <Text size={13} color={colors.textSecondary}>
              Food or clothes — takes a minute
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
              Add a shelter or community
            </Text>
            <Text size={13} color={colors.textSecondary}>
              Register a place that needs donations
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </PressableScale>

        <SectionHeader title="Active requests" />
        <View style={{ gap: 10 }}>
          {/* The donor's live request (just created) — tap to return to tracking. */}
          {liveAlloc && (
            <DonationCard
              category={liveAlloc.category}
              title={liveAlloc.title}
              status={liveAlloc.current}
              time={`To ${liveAlloc.consumer}`}
              onPress={() => router.push('/(donor)/track')}
              meta={[
                { icon: 'users', label: liveAlloc.serves ? `Serves ${liveAlloc.serves}` : (liveAlloc.pieces ?? '') },
                { icon: 'map-pin', label: `${liveAlloc.distance} km` },
              ]}
            />
          )}
          {active.map((d) => (
            <DonationCard
              key={d.id}
              category={d.category}
              title={d.title}
              status={d.status}
              time={`To ${d.consumer}`}
              onPress={() => {
                s.setAllocation({
                  id: d.id,
                  category: d.category,
                  title: d.title,
                  consumer: d.consumer,
                  current: d.status,
                  distance: d.distance,
                  serves: d.serves,
                  pieces: d.pieces,
                  needsVolunteer: true,
                });
                router.push('/(donor)/track');
              }}
              meta={[
                { icon: 'users', label: d.serves ? `Serves ${d.serves}` : (d.pieces ?? '') },
                { icon: 'map-pin', label: `${d.distance} km` },
              ]}
            />
          ))}
          {!liveAlloc && active.length === 0 && (
            <Text size={13} color={colors.textMuted}>
              No active requests yet — donate something to get started.
            </Text>
          )}
        </View>

        <SectionHeader
          title="Recent history"
          action="See all"
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
              meta={[{ icon: 'users', label: d.serves ? `Serves ${d.serves}` : (d.pieces ?? '') }]}
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
