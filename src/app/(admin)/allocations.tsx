/**
 * AdmAllocations — admin allocation review. Ported from AdminScreens.jsx
 * `AdmAllocations`. Filters by all/active/completed; each row opens a detail
 * sheet with status, recipient/volunteer, and any uploaded photo proof.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressPhotos } from '@/components/progress-photos';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { DetailRow } from '@/components/ui/detail-row';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import type { Allocation } from '@/data/types';

export default function AdmAllocations() {
  const router = useRouter();
  const t = useT();
  const s = useApp();
  const [f, setF] = useState('all');
  const [sel, setSel] = useState<Allocation | null>(null);

  let list = s.data.ALLOCATIONS;
  if (f === 'active') list = list.filter((a) => !['completed', 'cancelled'].includes(a.status));
  if (f === 'done') list = list.filter((a) => a.status === 'completed');

  const proofs = s.proofs ?? {};

  return (
    <Page
      nav={<RoleBottomNav role="admin" active="alloc" />}
      header={<AppBar title={t('admAlloc.title')} align="center" />}
    >
      <Tabs
        variant="underline"
        active={f}
        onChange={setF}
        items={[
          { key: 'all', label: t('admAlloc.tabAll') },
          { key: 'active', label: t('admAlloc.tabActive') },
          { key: 'done', label: t('status.completed') },
        ]}
        style={{ marginBottom: 14 }}
      />

      <View style={styles.card}>
        {list.map((a, i) => (
          <Pressable
            key={a.id}
            onPress={() => setSel(a)}
            style={[styles.row, i < list.length - 1 && styles.rowBorder]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size={15} weight={700}>
                {a.item}
              </Text>
              <Text size={12} color={colors.textMuted}>
                {a.consumer} · {a.volunteer}
              </Text>
            </View>
            <StatusBadge status={a.status} size="sm" />
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <BottomSheet
        open={!!sel}
        title={sel ? sel.item : ''}
        onClose={() => setSel(null)}
        footer={
          sel && (
            <Button
              fullWidth
              size="lg"
              leftIcon="map"
              onPress={() => {
                const a = sel;
                setSel(null);
                router.push({
                  pathname: '/track-map',
                  params: {
                    title: a.item,
                    pickup: t('admAlloc.donor'),
                    dropoff: a.consumer,
                    volunteer: a.volunteer && a.volunteer !== '—' ? a.volunteer : '',
                    status: a.status,
                  },
                });
              }}
            >
              {t('admAlloc.trackOnMap')}
            </Button>
          )
        }
      >
        {sel && (
          <View>
            <View style={styles.statusRow}>
              <Text size={13} color={colors.textMuted} weight={600}>
                {t('admAlloc.currentStatus')}
              </Text>
              <StatusBadge status={sel.status} size="sm" />
            </View>
            <DetailRow icon="building-2" label={t('admAlloc.recipient')} value={sel.consumer} />
            <DetailRow icon="bike" label={t('role.volunteer')} value={sel.volunteer} />

            <View style={{ marginTop: 16 }}>
              <Text size={13} weight={800} color={colors.textPrimary} style={{ marginBottom: 10 }}>
                {t('admAlloc.progressPhotos')}
              </Text>
              <ProgressPhotos proofs={proofs} />
            </View>
          </View>
        )}
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: space[4],
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  proofGrid: { flexDirection: 'row', gap: 10 },
  proofThumb: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    aspectRatio: 1,
  },
  proofImage: { width: '100%', height: '100%' },
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
  proofLabel: { marginTop: 5, textTransform: 'capitalize' },
  proofEmpty: {
    padding: 14,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
  },
});
