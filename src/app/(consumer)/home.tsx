/**
 * Consumer Home — recipient dashboard. Ported from ConsumerScreens.jsx `ConHome`.
 * Hero shows the current need with an "Update" pill, then received/incoming lists.
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { MessagesButton } from '@/components/messages-button';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { Avatar } from '@/components/ui/avatar';
import { DonationCard } from '@/components/ui/donation-card';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import { colors, palette, radius, space } from '@/theme';
import { formatRelative } from '@/utils/datetime';

export default function ConHome() {
  const router = useRouter();
  const s = useApp();
  const p = s.profiles.consumer;

  return (
    <Page
      nav={<RoleBottomNav role="consumer" active="home" />}
      pad={false}
      header={
        <Hero
          accent={colors.clothes}
          accent2={palette.teal700}
          eyebrow="Recipient"
          title={p.name}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MessagesButton />
              <Avatar name={p.name} src={p.photo ?? undefined} accent="clothes" ring />
            </View>
          }
        >
          <View style={styles.needRow}>
            <View>
              <Text size={12} weight={600} color="#fff" style={{ opacity: 0.85 }}>
                Current need
              </Text>
              <Text size={17} weight={800} color="#fff">
                Meals for 40 people
              </Text>
              {s.needUpdatedAt != null && (
                <Text size={11} weight={600} color="#fff" style={{ opacity: 0.85, marginTop: 2 }}>
                  Updated {formatRelative(s.needUpdatedAt)}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push('/(consumer)/need')}
              accessibilityRole="button"
              accessibilityLabel="Update current need"
              style={styles.updatePill}
            >
              <Text size={13} weight={700} color={palette.teal700}>
                Update
              </Text>
            </Pressable>
          </View>
        </Hero>
      }
    >
      <View style={styles.stats}>
        <StatCard value="214" label="Meals received" accent="food" icon={<Icon name="utensils" size={20} color={palette.orange600} />} />
        <StatCard value="86" label="Items received" accent="clothes" icon={<Icon name="shirt" size={20} color={palette.teal600} />} />
      </View>

      <View style={styles.body}>
        <SectionHeader title="Incoming donations" />
        <View style={styles.list}>
          {s.data.CONSUMER_INCOMING.map((d) => (
            <DonationCard
              key={d.id}
              category={d.category}
              title={d.title}
              status={d.status}
              time={`${d.eta} · from ${d.donor}`}
              meta={[]}
              onPress={() =>
                router.push({
                  pathname: '/track-map',
                  params: {
                    title: d.title,
                    pickup: d.donor,
                    dropoff: p.name,
                    status: d.status,
                  },
                })
              }
            />
          ))}
        </View>

        <SectionHeader title="Recently received" action="Reports" onAction={() => router.push('/(consumer)/reports')} />
        <View style={styles.list}>
          {s.data.CONSUMER_RECEIVED.map((d) => (
            <DonationCard
              key={d.id}
              category={d.category}
              title={d.title}
              status="completed"
              time={`${d.time} · from ${d.donor}`}
              meta={[]}
            />
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  updatePill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: space[4],
    paddingHorizontal: 20,
  },
  body: { paddingHorizontal: 20 },
  list: { flexDirection: 'column', gap: 10 },
});
