/**
 * VolTask — volunteer active-task sub-flow. Ported from VolunteerScreens.jsx
 * `VolTask` plus its local `ContactRow` / `LocationRow` helpers. Status timeline,
 * pickup/drop contacts, photo-proof updates, and an optional transport request.
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { ProgressPhotos } from '@/components/progress-photos';
import { TeamSection } from '@/components/team-section';
import { TrackPanel } from '@/components/track-panel';
import { AppBar } from '@/components/ui/app-bar';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { Timeline } from '@/components/ui/timeline';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, leading, palette, radius, shadows, space } from '@/theme';
import { formatStamp } from '@/utils/datetime';
import { callNumber, openDirections } from '@/utils/contact';
import type { DeliveryReward } from '@/config/rewards';
import type { Status, Transport } from '@/data/types';

const NEXT: Record<string, Status> = {
  accepted: 'picked_up',
  picked_up: 'delivered',
  delivered: 'completed',
};
const NEXT_LABEL_KEY: Record<string, string> = {
  accepted: 'volTask.markPickedUp',
  picked_up: 'volTask.markDelivered',
  delivered: 'volTask.completeDelivery',
};
const PROOF_WORD_KEY: Record<string, string> = {
  picked_up: 'volTask.proofPickup',
  delivered: 'volTask.proofDelivery',
  completed: 'volTask.proofCompletion',
};

function vehicleIcon(type: string): string {
  if (type === 'Cargo van') return 'truck';
  if (type === 'Two-wheeler') return 'bike';
  return 'car';
}

export default function VolTask() {
  const router = useRouter();
  const tr = useT();
  const s = useApp();
  const t = s.activeTask;

  const [proofSheet, setProofSheet] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [transportSheet, setTransportSheet] = useState(false);
  const [reward, setReward] = useState<DeliveryReward | null>(null);

  const back = () => router.back();

  if (!t) {
    return (
      <Page header={<AppBar title={tr('volTask.title')} onBack={back} />}>
        <EmptyState
          icon="clipboard-list"
          title={tr('volTask.noActiveTaskTitle')}
          message={tr('volTask.noActiveTaskMessage')}
          accent="neutral"
        />
      </Page>
    );
  }

  const n = NEXT[t.current];
  const taskProofs = t.proofs || {};
  const proofKeys = Object.keys(taskProofs);
  const fleet = s.data.TRANSPORT.filter((v) => v.status === 'AVAILABLE');
  // Live ride offers from transport providers for this delivery (cross-account).
  const jobOffers = s.transportOffers.filter((o) => o.jobId === t.id && !o.accepted);

  const ts = t.timestamps ?? {};
  const stamp = (k: Status) => (ts[k] != null ? formatStamp(ts[k] as number) : undefined);

  const donorName = t.donor || 'Asha V.';
  const donorPhone = s.data.DONORS[0]?.contact;
  const pickupAddr = '12 Carter Rd, Bandra West';
  const dropName = t.drop || 'Hope Shelter';
  const dropAddr = '48 Hill Road, Bandra West · Gate 2';
  const openChat = (name: string, phone?: string) =>
    router.push({ pathname: '/chat', params: { name, phone: phone ?? '' } });

  const assignTransport = (v: Transport) => {
    s.updateVolTask(t.id, { transport: v });
    setTransportSheet(false);
    s.showToast(tr('volTask.toastVehicleRequested', { type: v.type }), 'success');
  };
  const cancelTransport = () => {
    s.updateVolTask(t.id, { transport: null });
    s.showToast(tr('volTask.toastTransportCancelled'));
  };
  const confirmUpdate = () => {
    if (!photo) return;
    const at = Date.now();
    const nextProofs = { ...taskProofs, [n]: { uri: photo, at } };
    s.addProof(n, photo);
    s.updateVolTask(t.id, { current: n, proofs: nextProofs });
    setProofSheet(false);
    setPhoto(null);
    if (n === 'completed') {
      // Real reward: points + streak + badges, with an itemized celebration.
      const earned = s.awardDelivery({
        title: t.title,
        category: t.category,
        distance: t.distance,
        people: t.people,
        proofs: nextProofs,
        team: t.team,
      });
      setReward(earned);
    } else {
      s.showToast(tr('volTask.toastMarked', { status: tr(`status.${n}`) }), 'success');
    }
  };

  return (
    <Page
      header={
        <AppBar title={tr('volTask.title')} onBack={back} action={<StatusBadge status={t.current} size="sm" />} />
      }
      footer={
        t.current === 'completed' ? (
          <Button fullWidth variant="secondary" onPress={back}>
            {tr('volTask.backToTasks')}
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            leftIcon="camera"
            onPress={() => {
              setPhoto(null);
              setProofSheet(true);
            }}
          >
            {NEXT_LABEL_KEY[t.current] ? tr(NEXT_LABEL_KEY[t.current]) : tr('common.continue')}
          </Button>
        )
      }
    >
      <View style={styles.card}>
        <Text variant="h3" weight={800} color={colors.textPrimary}>
          {t.title}
        </Text>
        <View style={styles.headMeta}>
          <View style={styles.metaItem}>
            <Icon name="navigation" size={14} color={colors.textSecondary} />
            <Text variant="sm" weight={600} color={colors.textSecondary}>
              {tr('volTask.kmAway', { distance: t.distance })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text variant="sm" weight={600} color={colors.textSecondary}>
              {t.time}
            </Text>
          </View>
        </View>
      </View>

      <SectionHeader title={tr('volTask.pickupDonor')} />
      <ContactRow
        name={donorName}
        sub={pickupAddr}
        accent="food"
        phone={donorPhone}
        onMessage={() => openChat(donorName, donorPhone)}
      />

      <SectionHeader title={tr('volTask.dropoffRecipient')} />
      <LocationRow
        name={dropName}
        sub={tr('volTask.communityShelterServes', { count: 40 })}
        address={dropAddr}
        onDirections={() => openDirections('48 Hill Road, Bandra West, Mumbai')}
      />

      <TeamSection
        title={tr('volTask.taskTeam')}
        members={t.team ?? []}
        candidates={[...s.team, ...s.suggestions]
          .filter((v) => v.name !== s.profiles.volunteer.name)
          .map((v) => ({
            id: v.id,
            name: v.name,
            contact: v.contact,
            hint: tr('volTask.tripsCount', { count: v.trips }),
          }))}
        onAdd={(c) =>
          s.addTaskTeammate(t.id, { id: c.id, name: c.name, contact: c.contact, addedBy: 'volunteer' })
        }
        onRemove={(id) => s.removeTaskTeammate(t.id, id)}
        addLabel={tr('volTask.addTeammate')}
      />

      <SectionHeader title={tr('volTask.trackOnMap')} />
      <TrackPanel
        pickup={{ name: donorName }}
        dropoff={{ name: dropName }}
        volunteer={{ name: s.profiles.volunteer.name }}
        transport={t.transport ? { label: t.transport.type } : undefined}
        onExpand={() =>
          router.push({
            pathname: '/track-map',
            params: {
              title: t.title,
              pickup: donorName,
              dropoff: dropName,
              volunteer: s.profiles.volunteer.name,
              transport: t.transport ? t.transport.type : '',
              status: t.current,
            },
          })
        }
      />

      <SectionHeader title={tr('volTask.updateStatus')} />
      <View style={styles.timelineCard}>
        <Timeline
          current={t.current as 'accepted' | 'picked_up' | 'delivered' | 'completed'}
          steps={[
            { key: 'accepted', label: tr('status.accepted'), time: stamp('accepted') },
            { key: 'picked_up', label: tr('volTask.timelinePickedUp'), time: stamp('picked_up') },
            { key: 'delivered', label: tr('volTask.timelineDelivered'), time: stamp('delivered') },
            { key: 'completed', label: tr('status.completed'), time: stamp('completed') },
          ]}
        />
      </View>

      {proofKeys.length > 0 && (
        <>
          <SectionHeader title={tr('volTask.progressPhotos')} />
          <ProgressPhotos proofs={taskProofs} />
        </>
      )}

      <SectionHeader
        title={tr('volTask.transport')}
        action={t.transport ? undefined : tr('common.optional')}
      />
      {t.transport ? (
        <View style={styles.transportCard}>
          <View style={[styles.transportIcon, { backgroundColor: colors.brandSoft }]}>
            <Icon name={vehicleIcon(t.transport.type)} size={22} color={colors.brandStrong} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text size={15} weight={700} color={colors.textPrimary}>
              {t.transport.type}
              {t.transport.driver ? ` · ${t.transport.driver}` : ''}
            </Text>
            <Text size={12} mono color={colors.textMuted}>
              {t.transport.plate} ·{' '}
              {t.transport.pricing === 'paid'
                ? t.transport.fare || tr('volTask.paid')
                : t.transport.pricing === 'free'
                  ? tr('volTask.free')
                  : tr('volTask.requested')}
            </Text>
          </View>
          <Pressable onPress={cancelTransport} accessibilityRole="button" style={styles.cancelBtn}>
            <Text size={13} weight={700} color={colors.textSecondary}>
              {tr('common.cancel')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {jobOffers.length > 0 && (
            <Text variant="caption" weight={700} color={colors.brandStrong}>
              {jobOffers.length === 1
                ? tr('volTask.offersOne')
                : tr('volTask.offersMany', { count: jobOffers.length })}
            </Text>
          )}
          {jobOffers.map((o) => (
            <View key={o.id} style={styles.offerCard}>
              <View style={[styles.transportIcon, { backgroundColor: colors.brandSoft }]}>
                <Icon name={vehicleIcon(o.vehicleType)} size={22} color={colors.brandStrong} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text size={15} weight={700} color={colors.textPrimary}>
                  {o.vehicleType} · {o.provider}
                </Text>
                <Text size={12} mono color={colors.textMuted}>
                  {o.plate}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <StatusBadge tone={o.pricing === 'free' ? 'success' : 'food'} dot={false} size="sm">
                  {o.pricing === 'free' ? tr('volTask.free') : o.fare || tr('volTask.paid')}
                </StatusBadge>
                <Pressable
                  onPress={() => s.acceptTransportOffer(o)}
                  accessibilityRole="button"
                  style={styles.acceptOfferBtn}
                >
                  <Text size={13} weight={700} color="#fff">
                    {tr('volTask.accept')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
          <Pressable
            onPress={() => setTransportSheet(true)}
            accessibilityRole="button"
            style={styles.requestVehicle}
          >
            <View style={[styles.transportIcon, { backgroundColor: colors.surfaceSunken }]}>
              <Icon name="truck" size={22} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text size={15} weight={700} color={colors.textPrimary}>
                {tr('volTask.requestFromFleet')}
              </Text>
              <Text size={12} color={colors.textMuted}>
                {tr('volTask.requestFromFleetHint')}
              </Text>
            </View>
            <Icon name="plus" size={20} color={colors.brandStrong} />
          </Pressable>
        </View>
      )}

      <BottomSheet
        open={transportSheet}
        title={tr('volTask.requestTransport')}
        onClose={() => setTransportSheet(false)}
      >
        <Text
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: space[3] + 2, lineHeight: 14 * leading.normal }}
        >
          {tr('volTask.requestTransportBody')}
        </Text>
        <View style={{ gap: 10 }}>
          {fleet.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text variant="sm" color={colors.textMuted} align="center">
                {tr('volTask.noVehicles')}
              </Text>
            </View>
          ) : (
            fleet.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => assignTransport(v)}
                accessibilityRole="button"
                style={styles.fleetRow}
              >
                <View style={[styles.fleetIcon, { backgroundColor: colors.surfaceSunken }]}>
                  <Icon name={vehicleIcon(v.type)} size={20} color={colors.textPrimary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text size={14} weight={700} color={colors.textPrimary}>
                    {v.type}
                  </Text>
                  <Text size={12} mono color={colors.textMuted}>
                    {v.plate}
                  </Text>
                </View>
                {v.pricing && (
                  <StatusBadge tone={v.pricing === 'free' ? 'success' : 'food'} dot={false} size="sm">
                    {v.pricing === 'free' ? tr('volTask.free') : v.fare || tr('volTask.paid')}
                  </StatusBadge>
                )}
                <Icon name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </View>
      </BottomSheet>

      <BottomSheet
        open={proofSheet}
        title={tr('volTask.photoProofTitle', {
          word: PROOF_WORD_KEY[n] ? tr(PROOF_WORD_KEY[n]) : '',
        })}
        onClose={() => setProofSheet(false)}
        footer={
          <Button fullWidth size="lg" disabled={!photo} onPress={confirmUpdate}>
            {photo ? tr('volTask.confirmUpdate') : tr('volTask.addPhotoToContinue')}
          </Button>
        }
      >
        <Text
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: space[3] + 2, lineHeight: 14 * leading.normal }}
        >
          {tr('volTask.photoRequired', {
            word: PROOF_WORD_KEY[n] ? tr(PROOF_WORD_KEY[n]) : '',
          })}
        </Text>
        <PhotoPicker
          value={photo ?? undefined}
          onPick={setPhoto}
          size={160}
          label={tr('volTask.takeChoosePhoto')}
          accent={colors.brand}
        />
      </BottomSheet>

      <BottomSheet
        open={!!reward}
        title={tr('volTask.deliveryComplete')}
        onClose={() => setReward(null)}
        footer={
          <Button
            fullWidth
            size="lg"
            onPress={() => {
              setReward(null);
              back();
            }}
          >
            {tr('common.done')}
          </Button>
        }
      >
        {reward && <RewardCelebration reward={reward} />}
      </BottomSheet>
    </Page>
  );
}

function RewardCelebration({ reward }: { reward: DeliveryReward }) {
  const tr = useT();
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }).start();
  }, [pop]);
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={{ gap: space[3] }}>
      <Animated.View style={[styles.celebrateTop, { opacity: pop, transform: [{ scale }] }]}>
        <View style={styles.celebrateTrophy}>
          <Icon name="award" size={34} color={palette.gold600} />
        </View>
        <Text size={34} weight={800} color={palette.gold600} style={{ lineHeight: 38 }}>
          +{reward.total}
        </Text>
        <Text size={13} weight={700} color={colors.textSecondary}>
          {tr('volTask.pointsEarned')}
        </Text>
      </Animated.View>

      {reward.newBadges.length > 0 && (
        <View style={styles.celebrateBadges}>
          {reward.newBadges.map((b) => (
            <View key={b.id} style={styles.celebrateBadge}>
              <Icon name={b.icon} size={18} color={palette.gold600} />
              <Text size={13} weight={700} color={colors.textPrimary}>
                {tr('volTask.badgeUnlocked', { name: tr(`rewards.badge.${b.id}.name`) })}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.celebrateList}>
        {reward.items.map((it, i) => (
          <View
            key={`${it.label}-${i}`}
            style={[styles.celebrateRow, i < reward.items.length - 1 && styles.celebrateDivider]}
          >
            <Text size={13} weight={600} color={colors.textSecondary} style={{ flex: 1 }}>
              {it.label}
            </Text>
            <Text size={13} weight={700} color={colors.textPrimary}>
              +{it.points}
            </Text>
          </View>
        ))}
        {reward.multiplierBonus > 0 && (
          <View style={[styles.celebrateRow, styles.celebrateDivider]}>
            <Text size={13} weight={700} color={palette.orange600} style={{ flex: 1 }}>
              {tr('volTask.streakBonus', {
                weeks: reward.weeklyStreak,
                multiplier: reward.multiplier,
              })}
            </Text>
            <Text size={13} weight={800} color={palette.orange600}>
              +{reward.multiplierBonus}
            </Text>
          </View>
        )}
        {reward.milestoneBonus > 0 && (
          <View style={styles.celebrateRow}>
            <Text size={13} weight={700} color={colors.brandStrong} style={{ flex: 1 }}>
              {tr('volTask.milestoneBonus', { label: reward.milestoneLabel ?? '' })}
            </Text>
            <Text size={13} weight={800} color={colors.brandStrong}>
              +{reward.milestoneBonus}
            </Text>
          </View>
        )}
      </View>

      {!reward.streakQualified && (
        <Text size={12} color={colors.textMuted} align="center">
          {tr('volTask.streakHint')}
        </Text>
      )}
    </View>
  );
}

function ContactRow({
  name,
  sub,
  accent,
  phone,
  onMessage,
}: {
  name: string;
  sub: string;
  accent: 'food' | 'clothes' | 'brand';
  phone?: string;
  onMessage: () => void;
}) {
  const tr = useT();
  return (
    <View style={styles.contactRow}>
      <Avatar name={name} accent={accent} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text size={15} weight={700} color={colors.textPrimary}>
          {name}
        </Text>
        <Text size={12} color={colors.textMuted}>
          {sub}
        </Text>
      </View>
      <Pressable
        onPress={onMessage}
        accessibilityRole="button"
        accessibilityLabel={tr('volTask.messageName', { name })}
        style={styles.msgBtn}
      >
        <Icon name="message-circle" size={18} color={colors.textPrimary} />
      </Pressable>
      <Pressable
        onPress={() => callNumber(phone)}
        accessibilityRole="button"
        accessibilityLabel={tr('volTask.callName', { name })}
        style={styles.callBtn}
      >
        <Icon name="phone" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

function LocationRow({
  name,
  sub,
  address,
  onDirections,
}: {
  name: string;
  sub: string;
  address: string;
  onDirections: () => void;
}) {
  const tr = useT();
  return (
    <View style={styles.locationCard}>
      <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
        <View style={[styles.locationIcon, { backgroundColor: colors.clothesSoft }]}>
          <Icon name="map-pin" size={22} color={colors.clothes} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text size={15} weight={700} color={colors.textPrimary}>
            {name}
          </Text>
          <Text size={12} color={colors.textMuted}>
            {sub}
          </Text>
        </View>
      </View>
      <View style={styles.addressRow}>
        <Icon name="map-pin" size={15} color={colors.clothes} />
        <Text variant="sm" weight={600} color={colors.textSecondary} style={{ flex: 1 }}>
          {address}
        </Text>
      </View>
      <Pressable
        onPress={onDirections}
        accessibilityRole="button"
        accessibilityLabel={tr('volTask.getDirections')}
        style={styles.directionsBtn}
      >
        <Icon name="navigation" size={16} color="#fff" />
        <Text variant="body" weight={700} color="#fff">
          {tr('volTask.getDirections')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadows.sm,
  },
  headMeta: { flexDirection: 'row', gap: 14, marginTop: space[2] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timelineCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: space[4],
    ...shadows.sm,
  },
  proofImgWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    aspectRatio: 1,
    backgroundColor: colors.surfaceSunken,
  },
  proofImg: { width: '100%', height: '100%' },
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
  transportCard: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  transportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    height: 36,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestVehicle: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: 14,
  },
  offerCard: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  acceptOfferBtn: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: 14,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
  },
  fleetRow: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: space[3],
  },
  fleetIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    marginTop: space[3],
    paddingVertical: 10,
    paddingHorizontal: space[3],
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
  },
  directionsBtn: {
    flexDirection: 'row',
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.clothes,
  },
  celebrateTop: { alignItems: 'center', gap: 4, paddingTop: space[1] },
  celebrateTrophy: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.rewardSoft,
    borderWidth: 1.5,
    borderColor: palette.gold300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  celebrateBadges: { gap: 8 },
  celebrateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.rewardSoft,
    borderWidth: 1,
    borderColor: palette.gold300,
  },
  celebrateList: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
  },
  celebrateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  celebrateDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
});
