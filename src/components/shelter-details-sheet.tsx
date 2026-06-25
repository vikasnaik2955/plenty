/**
 * ShelterDetailsSheet — shows a recipient's details (location photos, people,
 * address, contact, notes). Shared by the donor "nearby recipients" list and
 * the volunteer "shelters you added" list.
 */
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { DetailRow } from '@/components/ui/detail-row';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { radius, space } from '@/theme';
import { formatDateTime, monthName } from '@/utils/datetime';
import type { Consumer } from '@/data/types';

export function ShelterDetailsSheet({
  consumer,
  onClose,
  footer,
}: {
  consumer: Consumer | null;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const t = useT();
  const s = useApp();
  const counts = consumer ? s.donationCounts[consumer.name] : undefined;
  const total = counts ? counts.food + counts.clothes : 0;
  const breakdown = counts
    ? t('shelterDetails.breakdown', { total, food: counts.food, clothes: counts.clothes })
    : t('shelterDetails.breakdownZero');

  return (
    <BottomSheet open={!!consumer} title={consumer?.name ?? ''} onClose={onClose} footer={footer}>
      {consumer && (
        <View>
          {consumer.images && consumer.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: space[3] }}
            >
              {consumer.images.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={{ width: 150, height: 110, borderRadius: radius.md }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          )}
          <DetailRow icon="building-2" label={t('shelterDetails.type')} value={consumer.type} />
          <DetailRow
            icon="gift"
            label={t('shelterDetails.donations', { month: monthName() })}
            value={breakdown}
          />
          <DetailRow
            icon="users"
            label={t('shelterDetails.people')}
            value={t('shelterDetails.peopleCount', { count: consumer.people })}
          />
          <DetailRow
            icon="navigation"
            label={t('shelterDetails.distance')}
            value={t('shelterDetails.distanceAway', { distance: consumer.distance })}
          />
          {consumer.address ? (
            <DetailRow icon="map-pin" label={t('shelterDetails.address')} value={consumer.address} />
          ) : null}
          {consumer.contact ? (
            <DetailRow icon="phone" label={t('shelterDetails.contact')} value={consumer.contact} />
          ) : null}
          {consumer.notes ? (
            <DetailRow icon="sticky-note" label={t('shelterDetails.notes')} value={consumer.notes} />
          ) : null}
          {consumer.addedAt != null ? (
            <DetailRow
              icon="calendar-plus"
              label={t('shelterDetails.added')}
              value={formatDateTime(consumer.addedAt)}
            />
          ) : null}
        </View>
      )}
    </BottomSheet>
  );
}
