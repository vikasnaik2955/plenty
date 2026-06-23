/**
 * VolHome — volunteer requests tab. Ported from VolunteerScreens.jsx `VolHome`.
 * Availability hero + trip/reward stats, active tasks (tap to open the task
 * sub-flow), and nearby open requests with accept / decline.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MessagesButton } from '@/components/messages-button';
import { NotificationsButton } from '@/components/notifications-button';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { ShelterDetailsSheet } from '@/components/shelter-details-sheet';
import { TrackPanel } from '@/components/track-panel';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { DetailRow } from '@/components/ui/detail-row';
import { EmptyState } from '@/components/ui/empty-state';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { PressableScale } from '@/components/ui/pressable-scale';
import { RequestCard } from '@/components/ui/request-card';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { tierForPoints } from '@/config/rewards';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';
import { formatRelative } from '@/utils/datetime';
import type { Consumer, OpenRequest, VolunteerTask } from '@/data/types';

const ACTION_LABEL: Record<string, string> = {
  accepted: 'Pick up',
  picked_up: 'Deliver',
  delivered: 'Complete',
};

const grp = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function VolHome() {
  const router = useRouter();
  const s = useApp();
  const profile = s.profiles.volunteer;

  const [available, setAvailable] = useState(true);
  const [detail, setDetail] = useState<Consumer | null>(null);
  const [review, setReview] = useState<OpenRequest | null>(null);

  const addedShelters = s.data.CONSUMERS.filter((c) => c.addedByUser);

  const acceptReviewed = () => {
    if (!review) return;
    const id = review.id;
    setReview(null);
    s.acceptRequest(id);
    router.push('/(volunteer)/task');
  };
  const declineReviewed = () => {
    if (!review) return;
    s.declineRequest(review.id);
    setReview(null);
  };

  const activeIds = s.volActive.map((t) => t.id);
  const requests = s.data.OPEN_REQUESTS.filter(
    (r) => !activeIds.includes(r.id) && !s.declinedRequests.includes(r.id),
  );
  const activeTasks = s.volActive.filter((t) => t.current !== 'completed');
  const tierName = tierForPoints(s.volRewards.lifetimePoints).name;

  const openTask = (id: string) => {
    s.setVolTask(id);
    router.push('/(volunteer)/task');
  };

  return (
    <Page
      nav={<RoleBottomNav role="volunteer" active="home" />}
      pad={false}
      header={
        <Hero
          accent={colors.brand}
          accent2={colors.brandStrong}
          eyebrow="Volunteer"
          title={profile.name}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <NotificationsButton />
              <MessagesButton />
              <Avatar name={profile.name} src={profile.photo ?? undefined} accent="brand" ring />
            </View>
          }
        >
          <View style={styles.availRow}>
            <View>
              <Text size={15} weight={800} color="#fff">
                {available ? 'Available' : 'Busy'}
              </Text>
              <Text size={12} color="#fff" style={{ opacity: 0.85 }}>
                {available ? 'Receiving nearby requests' : 'Not receiving requests'}
              </Text>
            </View>
            <Switch checked={available} onChange={setAvailable} />
          </View>
        </Hero>
      }
    >
      <View style={styles.statRow}>
        <StatCard
          value={grp(s.volRewards.deliveriesCompleted)}
          label="Total trips"
          accent="brand"
          icon={<Icon name="truck" size={20} color={colors.brandStrong} />}
        />
        <Pressable
          style={{ flex: 1 }}
          onPress={() => router.push('/(volunteer)/rewards')}
          accessibilityRole="button"
          accessibilityLabel="Open your rewards"
        >
          <StatCard
            value={grp(s.volRewards.balance)}
            label={`${tierName} · view rewards`}
            accent="reward"
            icon={<Icon name="award" size={20} color={colors.reward} />}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Pressable
          onPress={() => router.push('/(volunteer)/add-shelter')}
          accessibilityRole="button"
          accessibilityLabel="Register a shelter or community"
          style={styles.addShelter}
        >
          <View style={styles.addShelterIcon}>
            <Icon name="building-2" size={22} color={colors.clothes} />
          </View>
          <View style={{ flex: 1 }}>
            <Text size={15} weight={700} color={colors.textPrimary}>
              Register a shelter or community
            </Text>
            <Text size={12} color={colors.textMuted}>
              Add a place that needs donations — with photos
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>

        {addedShelters.length > 0 && (
          <>
            <SectionHeader title={`Shelters you added · ${addedShelters.length}`} />
            <View style={{ gap: 10 }}>
              {addedShelters.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setDetail(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${c.name} details`}
                  style={styles.shelterRow}
                >
                  <View style={styles.addShelterIcon}>
                    <Icon name="building-2" size={22} color={colors.clothes} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text size={15} weight={700} color={colors.textPrimary}>
                      {c.name}
                    </Text>
                    <Text size={12} color={colors.textMuted}>
                      {c.type} · {c.people} people
                      {c.images && c.images.length > 0 ? ` · ${c.images.length} photos` : ''}
                    </Text>
                    {c.addedAt != null && (
                      <Text size={11} color={colors.textMuted} style={{ marginTop: 1 }}>
                        Added {formatRelative(c.addedAt)}
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SectionHeader title={`Active tasks · ${activeTasks.length}`} />
        {activeTasks.length === 0 ? (
          <EmptyState
            compact
            icon="clipboard-list"
            title="No active tasks"
            message="Accept a nearby request and it'll show up here to pick up and deliver."
            accent="neutral"
          />
        ) : (
          <View style={{ gap: 10 }}>
            {activeTasks.map((t) => (
              <ActiveTaskRow key={t.id} task={t} onPress={() => openTask(t.id)} />
            ))}
          </View>
        )}

        <SectionHeader title={`Nearby requests${available ? ` · ${requests.length}` : ''}`} />
        {!available ? (
          <EmptyState
            compact
            icon="moon"
            title="You're offline"
            message="Turn on availability to see nearby requests."
            accent="neutral"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            compact
            icon="check-check"
            title="All caught up"
            message="No open requests near you right now."
          />
        ) : (
          <View style={{ gap: space[3] }}>
            {requests.map((r) => (
              <RequestCard
                key={r.id}
                category={r.category}
                title={r.title}
                donor={r.donor}
                distance={r.distance}
                people={r.people}
                time={r.time}
                acceptLabel="Review"
                onAccept={() => setReview(r)}
                onDecline={() => s.declineRequest(r.id)}
              />
            ))}
          </View>
        )}
      </View>

      <BottomSheet
        open={!!review}
        title="Review request"
        onClose={() => setReview(null)}
        footer={
          review && (
            <View style={{ gap: space[2] }}>
              <Button fullWidth size="lg" leftIcon="check" onPress={acceptReviewed}>
                Accept request
              </Button>
              <Button fullWidth variant="secondary" onPress={declineReviewed}>
                Decline
              </Button>
            </View>
          )
        }
      >
        {review && (
          <View style={{ gap: space[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
              <StatusBadge tone={review.category === 'food' ? 'food' : 'clothes'} dot={false} size="sm">
                {review.category === 'food' ? 'Food' : 'Clothes'}
              </StatusBadge>
              <Text variant="lg" weight={800} style={{ flex: 1 }} numberOfLines={2}>
                {review.title}
              </Text>
            </View>

            <View>
              <DetailRow icon="user" label="Donor" value={review.donor} />
              <DetailRow icon="users" label="Need" value={`Serves ${review.people}`} />
              <DetailRow icon="navigation" label="Distance" value={`${review.distance} km away`} />
              <DetailRow icon="clock" label="Pickup window" value={review.time} />
              <DetailRow icon="building-2" label="Deliver to" value={review.drop} />
            </View>

            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <PressableScale
                onPress={() =>
                  router.push({
                    pathname: '/chat',
                    params: { name: review.donor, phone: s.data.DONORS[0]?.contact ?? '' },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Message ${review.donor}`}
                style={[styles.reviewBtn, { backgroundColor: colors.surfaceSunken }]}
              >
                <Icon name="message-circle" size={18} color={colors.textPrimary} />
                <Text size={14} weight={700} color={colors.textPrimary}>
                  Message
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => callNumber(s.data.DONORS[0]?.contact)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${review.donor}`}
                style={[styles.reviewBtn, { backgroundColor: colors.brand }]}
              >
                <Icon name="phone" size={18} color="#fff" />
                <Text size={14} weight={700} color="#fff">
                  Call
                </Text>
              </PressableScale>
            </View>

            <TrackPanel
              pickup={{ name: review.donor }}
              dropoff={{ name: review.drop }}
              height={160}
              onExpand={() =>
                router.push({
                  pathname: '/track-map',
                  params: { title: review.title, pickup: review.donor, dropoff: review.drop },
                })
              }
            />
          </View>
        )}
      </BottomSheet>

      <ShelterDetailsSheet consumer={detail} onClose={() => setDetail(null)} />
    </Page>
  );
}

function ActiveTaskRow({ task, onPress }: { task: VolunteerTask; onPress: () => void }) {
  const isFood = task.category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const soft = isFood ? colors.foodSoft : colors.clothesSoft;
  const action = ACTION_LABEL[task.current] ?? 'Continue';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.taskRow, { borderLeftColor: accent }]}
    >
      <View style={[styles.taskIcon, { backgroundColor: soft }]}>
        <Icon name={isFood ? 'utensils' : 'shirt'} size={22} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text size={15} weight={700} color={colors.textPrimary}>
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <StatusBadge status={task.current} size="sm" />
          <Text size={12} color={colors.textMuted}>
            to {task.drop || 'recipient'}
          </Text>
        </View>
      </View>
      <View style={styles.taskAction}>
        <Text size={13} weight={700} color={colors.brandStrong}>
          {action}
        </Text>
        <Icon name="chevron-right" size={16} color={colors.brandStrong} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
  },
  statRow: {
    flexDirection: 'row',
    gap: space[3],
    paddingTop: space[4],
    paddingHorizontal: space[5],
  },
  body: { paddingHorizontal: space[5] },
  addShelter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[5],
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCard,
  },
  addShelterIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.clothesSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    height: 46,
    borderRadius: radius.md,
  },
  taskRow: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 4,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 5 },
  taskAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
