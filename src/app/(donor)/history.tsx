/**
 * DonorHistory — donation history list with all/food/clothes filter tabs.
 * Ported from DonorScreens2.jsx `DonorHistory`.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { DonationCard, type DonationMeta } from '@/components/ui/donation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { Tabs } from '@/components/ui/tabs';
import { useApp } from '@/store/app-store';

export default function DonorHistory() {
  const router = useRouter();
  const s = useApp();
  const [filter, setFilter] = useState('all');

  let list = s.data.DONATIONS;
  if (filter === 'food') list = list.filter((d) => d.category === 'food');
  if (filter === 'clothes') list = list.filter((d) => d.category === 'clothes');

  return (
    <Page
      nav={<RoleBottomNav role="donor" active="history" />}
      header={<AppBar title="Donation history" align="center" />}
    >
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
        <EmptyState
          compact
          icon="inbox"
          title="Nothing here yet"
          message="Donations you make will show up here."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((d) => {
            const meta: DonationMeta[] = [
              { icon: 'users', label: d.serves ? `Serves ${d.serves}` : (d.pieces ?? '') },
            ];
            if (d.points) meta.push({ icon: 'award', label: `+${d.points}` });
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
