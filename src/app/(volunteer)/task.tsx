/**
 * VolTask — volunteer active-task sub-flow. Ported from VolunteerScreens.jsx
 * `VolTask` plus its local `ContactRow` / `LocationRow` helpers. Status timeline,
 * pickup/drop contacts, photo-proof updates, and an optional transport request.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
import { useApp } from '@/store/app-store';
import { colors, leading, radius, shadows, space } from '@/theme';
import { formatStamp } from '@/utils/datetime';
import { callNumber, openDirections } from '@/utils/contact';
import type { Status, Transport } from '@/data/types';

const NEXT: Record<string, Status> = {
  accepted: 'picked_up',
  picked_up: 'delivered',
  delivered: 'completed',
};
const NEXT_LABEL: Record<string, string> = {
  accepted: 'Mark picked up',
  picked_up: 'Mark delivered',
  delivered: 'Complete delivery',
};
const PROOF_WORD: Record<string, string> = {
  picked_up: 'pickup',
  delivered: 'delivery',
  completed: 'completion',
};

function vehicleIcon(type: string): string {
  if (type === 'Cargo van') return 'truck';
  if (type === 'Two-wheeler') return 'bike';
  return 'car';
}

export default function VolTask() {
  const router = useRouter();
  const s = useApp();
  const t = s.activeTask;

  const [proofSheet, setProofSheet] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [transportSheet, setTransportSheet] = useState(false);

  const back = () => router.back();

  if (!t) {
    return (
      <Page header={<AppBar title="Active task" onBack={back} />}>
        <EmptyState
          icon="clipboard-list"
          title="No active task"
          message="Accept a request to start a pickup and delivery."
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
    s.showToast(`${v.type} requested`, 'success');
  };
  const cancelTransport = () => {
    s.updateVolTask(t.id, { transport: null });
    s.showToast('Transport request cancelled');
  };
  const confirmUpdate = () => {
    if (!photo) return;
    s.addProof(n, photo);
    s.updateVolTask(t.id, { current: n, proofs: { ...taskProofs, [n]: { uri: photo, at: Date.now() } } });
    setProofSheet(false);
    setPhoto(null);
    s.showToast(
      n === 'completed' ? '+45 points earned 🎉' : `Marked ${n.replace('_', ' ')} · photo saved`,
      'success',
    );
  };

  return (
    <Page
      header={
        <AppBar title="Active task" onBack={back} action={<StatusBadge status={t.current} size="sm" />} />
      }
      footer={
        t.current === 'completed' ? (
          <Button fullWidth variant="secondary" onPress={back}>
            Back to tasks
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
            {NEXT_LABEL[t.current]}
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
              {t.distance} km
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

      <SectionHeader title="Pickup — donor" />
      <ContactRow
        name={donorName}
        sub={pickupAddr}
        accent="food"
        phone={donorPhone}
        onMessage={() => openChat(donorName, donorPhone)}
      />

      <SectionHeader title="Drop-off — recipient location" />
      <LocationRow
        name={dropName}
        sub="Community shelter · serves 40"
        address={dropAddr}
        onDirections={() => openDirections('48 Hill Road, Bandra West, Mumbai')}
      />

      <TeamSection
        title="Task team"
        members={t.team ?? []}
        candidates={[...s.team, ...s.suggestions]
          .filter((v) => v.name !== s.profiles.volunteer.name)
          .map((v) => ({ id: v.id, name: v.name, contact: v.contact, hint: `${v.trips} trips` }))}
        onAdd={(c) =>
          s.addTaskTeammate(t.id, { id: c.id, name: c.name, contact: c.contact, addedBy: 'volunteer' })
        }
        onRemove={(id) => s.removeTaskTeammate(t.id, id)}
        addLabel="Add a teammate"
      />

      <SectionHeader title="Track on map" />
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

      <SectionHeader title="Update status" />
      <View style={styles.timelineCard}>
        <Timeline
          current={t.current as 'accepted' | 'picked_up' | 'delivered' | 'completed'}
          steps={[
            { key: 'accepted', label: 'Accepted', time: stamp('accepted') },
            { key: 'picked_up', label: 'Picked up from donor', time: stamp('picked_up') },
            { key: 'delivered', label: 'Delivered to recipient', time: stamp('delivered') },
            { key: 'completed', label: 'Completed', time: stamp('completed') },
          ]}
        />
      </View>

      {proofKeys.length > 0 && (
        <>
          <SectionHeader title="Progress photos" />
          <ProgressPhotos proofs={taskProofs} />
        </>
      )}

      <SectionHeader title="Transport" action={t.transport ? undefined : 'Optional'} />
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
                ? t.transport.fare || 'Paid'
                : t.transport.pricing === 'free'
                  ? 'Free'
                  : 'requested'}
            </Text>
          </View>
          <Pressable onPress={cancelTransport} accessibilityRole="button" style={styles.cancelBtn}>
            <Text size={13} weight={700} color={colors.textSecondary}>
              Cancel
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {jobOffers.length > 0 && (
            <Text variant="caption" weight={700} color={colors.brandStrong}>
              {jobOffers.length} transport {jobOffers.length === 1 ? 'provider has' : 'providers have'} offered a ride
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
                  {o.pricing === 'free' ? 'Free' : o.fare || 'Paid'}
                </StatusBadge>
                <Pressable
                  onPress={() => s.acceptTransportOffer(o)}
                  accessibilityRole="button"
                  style={styles.acceptOfferBtn}
                >
                  <Text size={13} weight={700} color="#fff">
                    Accept
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
                Request from fleet
              </Text>
              <Text size={12} color={colors.textMuted}>
                Optional — for bulky or far deliveries
              </Text>
            </View>
            <Icon name="plus" size={20} color={colors.brandStrong} />
          </Pressable>
        </View>
      )}

      <BottomSheet
        open={transportSheet}
        title="Request transport"
        onClose={() => setTransportSheet(false)}
      >
        <Text
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: space[3] + 2, lineHeight: 14 * leading.normal }}
        >
          Pick an available vehicle to help carry this donation. This is optional — you can deliver on
          your own.
        </Text>
        <View style={{ gap: 10 }}>
          {fleet.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text variant="sm" color={colors.textMuted} align="center">
                No vehicles available right now.
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
                    {v.pricing === 'free' ? 'Free' : v.fare || 'Paid'}
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
        title={`Photo proof — ${PROOF_WORD[n] || ''}`}
        onClose={() => setProofSheet(false)}
        footer={
          <Button fullWidth size="lg" disabled={!photo} onPress={confirmUpdate}>
            {photo ? 'Confirm update' : 'Add a photo to continue'}
          </Button>
        }
      >
        <Text
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: space[3] + 2, lineHeight: 14 * leading.normal }}
        >
          A photo is required so the donor and admin can verify the {PROOF_WORD[n]}.
        </Text>
        <PhotoPicker
          value={photo ?? undefined}
          onPick={setPhoto}
          size={160}
          label="Take / choose photo"
          accent={colors.brand}
        />
      </BottomSheet>
    </Page>
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
        accessibilityLabel={`Message ${name}`}
        style={styles.msgBtn}
      >
        <Icon name="message-circle" size={18} color={colors.textPrimary} />
      </Pressable>
      <Pressable
        onPress={() => callNumber(phone)}
        accessibilityRole="button"
        accessibilityLabel={`Call ${name}`}
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
        accessibilityLabel="Get directions"
        style={styles.directionsBtn}
      >
        <Icon name="navigation" size={16} color="#fff" />
        <Text variant="body" weight={700} color="#fff">
          Get directions
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
});
