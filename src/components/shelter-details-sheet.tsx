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
  const s = useApp();
  const counts = consumer ? s.donationCounts[consumer.name] : undefined;
  const total = counts ? counts.food + counts.clothes : 0;
  const breakdown = counts
    ? `${total} this month (${counts.food} food · ${counts.clothes} clothes)`
    : `0 this month`;

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
          <DetailRow icon="building-2" label="Type" value={consumer.type} />
          <DetailRow icon="gift" label={`Donations · ${monthName()}`} value={breakdown} />
          <DetailRow icon="users" label="People" value={`${consumer.people} people`} />
          <DetailRow icon="navigation" label="Distance" value={`${consumer.distance} km away`} />
          {consumer.address ? (
            <DetailRow icon="map-pin" label="Address" value={consumer.address} />
          ) : null}
          {consumer.contact ? (
            <DetailRow icon="phone" label="Contact" value={consumer.contact} />
          ) : null}
          {consumer.notes ? (
            <DetailRow icon="sticky-note" label="Notes" value={consumer.notes} />
          ) : null}
          {consumer.addedAt != null ? (
            <DetailRow icon="calendar-plus" label="Added" value={formatDateTime(consumer.addedAt)} />
          ) : null}
        </View>
      )}
    </BottomSheet>
  );
}
