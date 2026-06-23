/**
 * DonorTrack — donation status tracker (timeline, volunteer card, proofs).
 * Ported from DonorScreens2.jsx `DonorTrack`. Reads the active allocation from
 * the store; advances/cancels via store actions.
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { DonorWaitingCard } from '@/components/donor-waiting-card';
import { ProgressPhotos } from '@/components/progress-photos';
import { TeamSection } from '@/components/team-section';
import { TrackPanel } from '@/components/track-panel';
import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { Timeline, type TimelineStep } from '@/components/ui/timeline';
import { VolunteerCard } from '@/components/ui/volunteer-card';
import { useApp } from '@/store/app-store';
import { colors, palette, radius, shadows, space } from '@/theme';
import { formatStamp } from '@/utils/datetime';
import { callNumber } from '@/utils/contact';
import type { Status } from '@/data/types';

export default function DonorTrack() {
  const router = useRouter();
  const s = useApp();
  const a = s.allocation;

  if (!a) {
    return (
      <Page header={<AppBar title="Track donation" onBack={() => router.back()} />}>
        <Text variant="body" color={colors.textSecondary}>
          No active donation.
        </Text>
      </Page>
    );
  }

  const isFood = a.category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const selfHandover = a.needsVolunteer === false;
  const hasVolunteer = !selfHandover && a.current !== 'requested' && a.current !== 'cancelled';
  // Waiting for a volunteer to accept (the engagement window) vs. auto-cancelled.
  const isWaiting = !selfHandover && a.current === 'requested';
  const isCancelled = a.current === 'cancelled';
  const vol = s.data.VOLUNTEERS[0];
  const proofKeys = Object.keys(s.proofs);
  // Transport providers who have offered/arranged a ride (accepted shown first).
  const transportForDonor = [
    ...s.transportOffers.filter((o) => o.accepted),
    ...s.transportOffers.filter((o) => !o.accepted),
  ].slice(0, 3);
  const timelineCurrent = a.current === 'cancelled' ? 'requested' : a.current;

  const ts = a.timestamps ?? {};
  const stamp = (k: Status) => (ts[k] != null ? formatStamp(ts[k] as number) : undefined);

  const selfSteps: TimelineStep[] = [
    { key: 'requested', label: 'Requested', time: stamp('requested') },
    { key: 'delivered', label: 'Handover arranged', time: stamp('delivered') },
    { key: 'completed', label: 'Completed', time: stamp('completed') },
  ];
  const volSteps: TimelineStep[] = [
    { key: 'requested', label: 'Requested', time: stamp('requested') },
    { key: 'accepted', label: 'Volunteer accepted', time: stamp('accepted') },
    { key: 'picked_up', label: 'Picked up', time: stamp('picked_up') },
    { key: 'delivered', label: 'Delivered', time: stamp('delivered') },
    { key: 'completed', label: 'Completed', time: stamp('completed') },
  ];

  const markHandover = () => {
    s.advanceAllocation('completed');
    s.showToast('Handover confirmed · +30 points 🎉', 'success');
  };

  let footer: React.ReactNode = null;
  if (selfHandover && a.current !== 'completed') {
    footer = (
      <Button fullWidth size="lg" onPress={markHandover} leftIcon="check">
        Mark as handed over
      </Button>
    );
  } else if (isCancelled) {
    footer = (
      <Button
        fullWidth
        size="lg"
        leftIcon="rotate-cw"
        onPress={() => s.retryAllocation()}
        style={{ backgroundColor: accent }}
      >
        Try again
      </Button>
    );
  } else if (isWaiting) {
    footer = (
      <Button
        fullWidth
        variant="destructive"
        onPress={() => {
          s.withdrawAllocation();
          s.showToast('Request withdrawn');
          router.back();
        }}
      >
        Cancel request
      </Button>
    );
  }

  return (
    <Page
      header={<AppBar title="Track donation" onBack={() => router.back()} />}
      footer={footer}
    >
      <View style={styles.headerCard}>
        <View style={[styles.headerIcon, { backgroundColor: isFood ? colors.foodSoft : colors.clothesSoft }]}>
          <Icon name={isFood ? 'utensils' : 'shirt'} size={24} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text size={17} weight={700} color={colors.textPrimary}>
            {a.title}
          </Text>
          <Text size={13} color={colors.textMuted}>
            To {a.consumer}
          </Text>
          {a.createdAt != null && (
            <Text size={12} color={colors.textMuted} style={{ marginTop: 1 }}>
              Requested {formatStamp(a.createdAt)}
            </Text>
          )}
        </View>
        <StatusBadge status={a.current} size="sm" />
      </View>

      {isWaiting && (
        <DonorWaitingCard
          category={a.category}
          consumer={a.consumer}
          serves={a.serves}
          expiresAt={a.expiresAt}
        />
      )}

      {isCancelled && (
        <View style={styles.cancelBanner}>
          <View style={styles.cancelIcon}>
            <Icon name="circle-x" size={20} color={colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text size={15} weight={700} color={colors.textPrimary}>
              Request cancelled
            </Text>
            <Text size={13} color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 13 * 1.5 }}>
              {a.cancelReason ?? 'This request was cancelled.'}
            </Text>
            {stamp('cancelled') && (
              <Text size={12} color={colors.textMuted} style={{ marginTop: 4 }}>
                Cancelled {stamp('cancelled')}
              </Text>
            )}
          </View>
        </View>
      )}

      {selfHandover && (
        <View style={styles.selfNote}>
          <Icon name="hand" size={18} color={colors.clothes} />
          <Text size={13} weight={600} color={palette.teal700} style={{ flex: 1, lineHeight: 13 * 1.45 }}>
            Self handover — no volunteer. Arrange the drop-off with {a.consumer} directly.
          </Text>
        </View>
      )}

      {hasVolunteer && (
        <>
          <SectionHeader title="Your volunteer" />
          <VolunteerCard
            name={vol.name}
            rating={vol.rating}
            distance={vol.distance}
            phone={vol.contact}
            onCall={() => callNumber(vol.contact)}
            onMessage={() =>
              router.push({ pathname: '/chat', params: { name: vol.name, phone: vol.contact } })
            }
          />
        </>
      )}

      {!selfHandover && (
        <TeamSection
          title="Delivery team"
          members={a.team ?? []}
          candidates={s.data.VOLUNTEERS.map((v) => ({
            id: v.id,
            name: v.name,
            contact: v.contact,
            hint: `${v.trips} trips · ${v.distance} km`,
          }))}
          onAdd={(c) =>
            s.assignAllocationVolunteer({ id: c.id, name: c.name, contact: c.contact, addedBy: 'donor' })
          }
          onRemove={(id) => s.removeAllocationVolunteer(id)}
          addLabel="Add a volunteer"
        />
      )}

      {!selfHandover && transportForDonor.length > 0 && (
        <>
          <SectionHeader title="Transport" />
          <View style={{ gap: 10 }}>
            {transportForDonor.map((o) => (
              <View key={o.id} style={styles.transportCard}>
                <View
                  style={[
                    styles.transportIcon,
                    { backgroundColor: o.accepted ? colors.brandSoft : colors.surfaceSunken },
                  ]}
                >
                  <Icon name="truck" size={22} color={o.accepted ? colors.brandStrong : colors.textSecondary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text size={15} weight={700} color={colors.textPrimary}>
                    {o.vehicleType} · {o.provider}
                  </Text>
                  <Text size={12} color={colors.textMuted}>
                    {o.accepted ? 'Transport arranged' : 'Offered a ride'} ·{' '}
                    {o.pricing === 'free' ? 'Free' : o.fare || 'Paid'}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/chat', params: { name: o.provider, phone: o.contact ?? '' } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Message ${o.provider}`}
                  style={styles.transportMsgBtn}
                >
                  <Icon name="message-circle" size={18} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  onPress={() => callNumber(o.contact)}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${o.provider}`}
                  style={styles.transportCallBtn}
                >
                  <Icon name="phone" size={18} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      <SectionHeader title="Track on map" />
      <TrackPanel
        pickup={{ name: s.profiles.donor.name }}
        dropoff={{ name: a.consumer }}
        volunteer={hasVolunteer ? { name: vol.name } : undefined}
        onExpand={() =>
          router.push({
            pathname: '/track-map',
            params: {
              title: a.title,
              pickup: s.profiles.donor.name,
              dropoff: a.consumer,
              volunteer: hasVolunteer ? vol.name : '',
              status: a.current,
            },
          })
        }
      />

      <SectionHeader title="Progress" />
      <View style={styles.timelineCard}>
        <Timeline current={timelineCurrent} steps={selfHandover ? selfSteps : volSteps} />
      </View>

      {!selfHandover && proofKeys.length > 0 && (
        <>
          <SectionHeader title="Progress photos" />
          <Text
            variant="caption"
            color={colors.textSecondary}
            style={{ marginTop: -4, marginBottom: 10 }}
          >
            Photos your volunteer uploaded at each step.
          </Text>
          <ProgressPhotos proofs={s.proofs} />
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadows.sm,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBanner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.lg,
  },
  cancelIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfNote: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.clothesSoft,
    borderRadius: radius.md,
  },
  timelineCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: space[4],
    ...shadows.sm,
  },
  transportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 12,
    ...shadows.sm,
  },
  transportIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  transportMsgBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportCallBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofImageWrap: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    aspectRatio: 1,
  },
  proofCheck: {
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
});
