/**
 * Delivery detail — shared, read-only history view that EVERY role can open
 * (`/delivery?id=`). Shows the full record: status, recipient, volunteer +
 * contact, transport, progress photos with upload times, and the timeline.
 * Only the donor (owner) sees an Edit button — everyone else views it read-only.
 */
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProgressPhotos } from '@/components/progress-photos';
import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { DetailRow } from '@/components/ui/detail-row';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Timeline } from '@/components/ui/timeline';
import { VolunteerCard } from '@/components/ui/volunteer-card';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';

export default function DeliveryDetail() {
  const router = useRouter();
  const t = useT();
  const s = useApp();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const donation = s.data.DONATIONS.find((d) => d.id === id);
  const canEdit = s.role === 'donor';

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(donation?.title ?? '');
  const [qty, setQty] = useState(
    donation?.serves != null ? String(donation.serves) : (donation?.pieces ?? ''),
  );
  const [note, setNote] = useState(donation?.note ?? '');

  if (!donation) {
    return (
      <Page header={<AppBar title={t('delivery.title')} onBack={() => router.back()} />}>
        <EmptyState icon="package-x" title={t('delivery.notFoundTitle')} message={t('delivery.notFoundMessage')} />
      </Page>
    );
  }

  const isFood = donation.category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const soft = isFood ? colors.foodSoft : colors.clothesSoft;
  const hasVolunteer = donation.volunteer && donation.volunteer !== '—';
  const vol = s.data.VOLUNTEERS.find((v) => v.name === donation.volunteer);
  const finished = donation.status === 'completed' || donation.status === 'cancelled';

  const save = () => {
    const patch = isFood
      ? { title: title.trim(), serves: parseInt(qty, 10) || donation.serves, note: note.trim() }
      : { title: title.trim(), pieces: qty.trim(), note: note.trim() };
    s.updateDonation(donation.id, patch);
    setEditing(false);
  };

  const qtyLabel = isFood ? t('delivery.servesQuestion') : t('delivery.quantity');

  return (
    <Page
      header={<AppBar title={t('delivery.detailsTitle')} onBack={() => router.back()} />}
      footer={
        canEdit ? (
          <Button fullWidth size="lg" leftIcon="pencil" onPress={() => setEditing(true)}>
            {t('delivery.editDonation')}
          </Button>
        ) : undefined
      }
    >
      <View style={styles.headerCard}>
        <View style={[styles.headerIcon, { backgroundColor: soft }]}>
          <Icon name={isFood ? 'utensils' : 'shirt'} size={24} color={accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text size={17} weight={700} color={colors.textPrimary}>
            {donation.title}
          </Text>
          <Text size={13} color={colors.textMuted}>
            {donation.time}
          </Text>
        </View>
        <StatusBadge status={donation.status} size="sm" />
      </View>

      <View style={styles.card}>
        <DetailRow icon="building-2" label={t('delivery.recipient')} value={donation.consumer} />
        <DetailRow
          icon="users"
          label={isFood ? t('delivery.serves') : t('delivery.quantity')}
          value={isFood ? t('delivery.servesPeople', { count: donation.serves ?? '—' }) : (donation.pieces ?? '—')}
        />
        <DetailRow icon="navigation" label={t('delivery.distance')} value={t('delivery.kmAway', { distance: donation.distance })} />
        {donation.points != null && (
          <DetailRow icon="award" label={t('delivery.reward')} value={t('delivery.points', { count: donation.points })} />
        )}
        {donation.note ? <DetailRow icon="sticky-note" label={t('delivery.note')} value={donation.note} /> : null}
      </View>

      {hasVolunteer && (
        <>
          <Text variant="sm" weight={800} style={styles.section}>
            {t('delivery.volunteer')}
          </Text>
          <VolunteerCard
            name={donation.volunteer}
            rating={vol?.rating}
            distance={vol?.distance}
            phone={vol?.contact}
            onCall={() => callNumber(vol?.contact)}
            onMessage={() =>
              router.push({ pathname: '/chat', params: { name: donation.volunteer, phone: vol?.contact ?? '' } })
            }
          />
        </>
      )}

      {donation.transport && (
        <>
          <Text variant="sm" weight={800} style={styles.section}>
            {t('delivery.transport')}
          </Text>
          <View style={styles.transportCard}>
            <View style={[styles.headerIcon, { backgroundColor: colors.brandSoft }]}>
              <Icon name="truck" size={22} color={colors.brandStrong} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size={15} weight={700} color={colors.textPrimary}>
                {donation.transport.type} · {donation.transport.driver}
              </Text>
              <Text size={12} color={colors.textMuted}>
                {donation.transport.pricing === 'paid'
                  ? donation.transport.fare || t('delivery.paid')
                  : t('delivery.freeRide')}
              </Text>
            </View>
          </View>
        </>
      )}

      <Text variant="sm" weight={800} style={styles.section}>
        {t('delivery.progressPhotos')}
      </Text>
      <ProgressPhotos proofs={donation.proofs} />

      <Text variant="sm" weight={800} style={styles.section}>
        {t('delivery.progress')}
      </Text>
      <View style={styles.timelineCard}>
        <Timeline current={donation.status} />
        {finished && (
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: space[2] }}>
            {t(`status.${donation.status}`)} · {donation.time}
          </Text>
        )}
      </View>

      <BottomSheet
        open={editing}
        title={t('delivery.editDonation')}
        onClose={() => setEditing(false)}
        footer={
          <Button fullWidth size="lg" disabled={!title.trim()} onPress={save}>
            {t('delivery.saveChanges')}
          </Button>
        }
      >
        <View style={{ gap: space[4] }}>
          <Input
            label={t('delivery.titleLabel')}
            value={title}
            onChangeText={setTitle}
            leftIcon={<Icon name={isFood ? 'utensils' : 'shirt'} size={18} color={colors.textMuted} />}
          />
          <Input
            label={qtyLabel}
            value={qty}
            onChangeText={setQty}
            keyboardType={isFood ? 'number-pad' : 'default'}
            leftIcon={<Icon name={isFood ? 'users' : 'package'} size={18} color={colors.textMuted} />}
          />
          <Textarea label={t('delivery.note')} value={note} onChangeText={setNote} maxLength={140} placeholder={t('delivery.notePlaceholder')} />
        </View>
      </BottomSheet>
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
    marginBottom: space[3],
  },
  headerIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: space[4],
    ...shadows.sm,
  },
  section: { marginTop: space[5], marginBottom: space[2] },
  transportCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
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
});
