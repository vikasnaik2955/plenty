/**
 * Deliveries — shared, read-only delivery history that every role can browse.
 * Tapping an item opens the delivery detail (`/delivery`), which is read-only
 * for everyone except the donor who owns it.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { DonationCard, type DonationMeta } from '@/components/ui/donation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { Tabs } from '@/components/ui/tabs';
import { useApp } from '@/store/app-store';

export default function DeliveriesScreen() {
  const router = useRouter();
  const s = useApp();
  const [filter, setFilter] = useState('all');

  let list = s.data.DONATIONS;
  if (filter === 'food') list = list.filter((d) => d.category === 'food');
  if (filter === 'clothes') list = list.filter((d) => d.category === 'clothes');

  return (
    <Page header={<AppBar title="Delivery history" onBack={() => router.back()} />}>
      <Tabs
        variant="underline"
        active={filter}
        onChange={setFilter}
        items={[
          { key: 'all', label: 'All' },
          { key: 'food', label: 'Food' },
          { key: 'clothes', label: 'Clothes' },
        ]}
        style={{ marginBottom: 14 }}
      />
      {list.length === 0 ? (
        <EmptyState compact icon="inbox" title="No deliveries yet" message="Completed deliveries will show up here." />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((d) => {
            const meta: DonationMeta[] = [
              { icon: 'users', label: d.serves ? `Serves ${d.serves}` : (d.pieces ?? '') },
            ];
            if (d.proofs && Object.keys(d.proofs).length > 0) {
              meta.push({ icon: 'image', label: `${Object.keys(d.proofs).length} photos` });
            }
            return (
              <DonationCard
                key={d.id}
                category={d.category}
                title={d.title}
                status={d.status}
                time={`${d.time} · ${d.consumer}`}
                meta={meta}
                onPress={() => router.push({ pathname: '/delivery', params: { id: d.id } })}
              />
            );
          })}
        </View>
      )}
    </Page>
  );
}
