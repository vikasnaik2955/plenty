/**
 * Saved addresses — manage the pickup/delivery addresses on the profile. Add,
 * edit, delete, and set a default. Store-backed, shared by every role.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import type { SavedAddress } from '@/data/types';

const QUICK_LABELS = ['Home', 'Work', 'Other'];
const QUICK_LABEL_KEY: Record<string, string> = {
  Home: 'addresses.quickHome',
  Work: 'addresses.quickWork',
  Other: 'addresses.quickOther',
};
const LABEL_ICON: Record<string, string> = { Home: 'house', Work: 'briefcase' };

export default function AddressesScreen() {
  const router = useRouter();
  const t = useT();
  const s = useApp();

  const [editing, setEditing] = useState<SavedAddress | 'new' | null>(null);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  const openNew = () => {
    setLabel('Home');
    setAddress('');
    setEditing('new');
  };
  const openEdit = (a: SavedAddress) => {
    setLabel(a.label);
    setAddress(a.address);
    setEditing(a);
  };

  const valid = label.trim().length > 0 && address.trim().length > 0;
  const save = () => {
    if (!valid) return;
    if (editing === 'new') s.addAddress({ label, address });
    else if (editing) s.updateAddress(editing.id, { label: label.trim(), address: address.trim() });
    setEditing(null);
  };

  return (
    <Page
      header={<AppBar title={t('addresses.title')} onBack={() => router.back()} />}
      footer={
        <Button fullWidth size="lg" leftIcon="plus" onPress={openNew}>
          {t('addresses.addAddress')}
        </Button>
      }
    >
      {s.addresses.length === 0 ? (
        <EmptyState
          icon="map-pin"
          title={t('addresses.emptyTitle')}
          message={t('addresses.emptyMessage')}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {s.addresses.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.iconTile}>
                  <Icon name={LABEL_ICON[a.label] ?? 'map-pin'} size={20} color={colors.brandStrong} />
                </View>
                <Text variant="body" weight={700} style={{ flex: 1 }}>
                  {a.label}
                </Text>
                {a.isDefault && (
                  <StatusBadge tone="success" dot={false} size="sm">
                    {t('addresses.default')}
                  </StatusBadge>
                )}
              </View>
              <Text variant="sm" color={colors.textSecondary} style={{ marginTop: 6, lineHeight: 20 }}>
                {a.address}
              </Text>
              <View style={styles.actions}>
                {!a.isDefault && (
                  <Pressable onPress={() => s.setDefaultAddress(a.id)} style={styles.action} accessibilityRole="button">
                    <Icon name="check-circle" size={16} color={colors.brandStrong} />
                    <Text size={13} weight={700} color={colors.brandStrong}>
                      {t('addresses.setDefault')}
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => openEdit(a)} style={styles.action} accessibilityRole="button">
                  <Icon name="pencil" size={16} color={colors.textSecondary} />
                  <Text size={13} weight={700} color={colors.textSecondary}>
                    {t('common.edit')}
                  </Text>
                </Pressable>
                <Pressable onPress={() => s.removeAddress(a.id)} style={styles.action} accessibilityRole="button">
                  <Icon name="trash-2" size={16} color={colors.error} />
                  <Text size={13} weight={700} color={colors.error}>
                    {t('common.delete')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <BottomSheet
        open={!!editing}
        title={editing === 'new' ? t('addresses.addAddress') : t('addresses.editAddress')}
        onClose={() => setEditing(null)}
        footer={
          <Button fullWidth size="lg" disabled={!valid} onPress={save}>
            {editing === 'new' ? t('addresses.saveAddress') : t('addresses.saveChanges')}
          </Button>
        }
      >
        <View style={{ gap: space[4] }}>
          <View>
            <Text variant="sm" weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
              {t('addresses.labelHeading')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {QUICK_LABELS.map((l) => (
                <Chip key={l} selected={label === l} accent="brand" onPress={() => setLabel(l)}>
                  {t(QUICK_LABEL_KEY[l])}
                </Chip>
              ))}
            </View>
          </View>
          <Input
            label={t('addresses.nameLabel')}
            value={label}
            onChangeText={setLabel}
            placeholder={t('addresses.namePlaceholder')}
            leftIcon={<Icon name="tag" size={18} color={colors.textMuted} />}
          />
          <Textarea
            label={t('addresses.fullAddress')}
            value={address}
            onChangeText={setAddress}
            placeholder={t('addresses.fullAddressPlaceholder')}
            maxLength={160}
          />
        </View>
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
    padding: 14,
    ...shadows.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: space[4],
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
