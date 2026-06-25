/**
 * Transport Vehicles — a provider manages their fleet: add, edit, delete
 * vehicles, toggle each one's availability, and set free/paid pricing per
 * vehicle. Store-backed; offers on the Jobs screen pick from these vehicles.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, fontSize, radius, shadows, space } from '@/theme';
import type { Pricing, TransportVehicle } from '@/data/types';

const VEHICLE_TYPE_VALUES = ['Two-wheeler', 'Auto rickshaw', 'Cargo van', 'Car'];
const vIcon = (t: string) => (t === 'Cargo van' ? 'truck' : t === 'Two-wheeler' ? 'bike' : t === 'Car' ? 'car' : 'caravan');
const typeKey = (v: string) =>
  v === 'Two-wheeler'
    ? 'transportVehicle.typeTwoWheeler'
    : v === 'Auto rickshaw'
      ? 'transportVehicle.typeAutoRickshaw'
      : v === 'Cargo van'
        ? 'transportVehicle.typeCargoVan'
        : 'transportVehicle.typeCar';

interface Form {
  type: string;
  plate: string;
  pricing: Pricing;
  fare: string;
  available: boolean;
}
const EMPTY: Form = { type: 'Two-wheeler', plate: '', pricing: 'free', fare: '', available: true };

export default function TransportVehicles() {
  const s = useApp();
  const t = useT();
  const [editing, setEditing] = useState<TransportVehicle | 'new' | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const vehicleTypeOptions = VEHICLE_TYPE_VALUES.map((v) => ({ value: v, label: t(typeKey(v)) }));

  const openNew = () => {
    setForm(EMPTY);
    setEditing('new');
  };
  const openEdit = (v: TransportVehicle) => {
    setForm({ type: v.type, plate: v.plate, pricing: v.pricing, fare: v.fare ?? '', available: v.available });
    setEditing(v);
  };

  const save = () => {
    const payload = {
      type: form.type,
      plate: form.plate.trim(),
      pricing: form.pricing,
      fare: form.pricing === 'paid' ? form.fare.trim() : undefined,
      available: form.available,
    };
    if (editing === 'new') s.addVehicle(payload);
    else if (editing) s.updateVehicle(editing.id, payload);
    setEditing(null);
  };

  return (
    <Page
      nav={<RoleBottomNav role="transport" active="vehicle" />}
      header={<AppBar title={t('transportVehicle.title')} align="center" />}
      footer={
        <Button fullWidth size="lg" leftIcon="plus" onPress={openNew}>
          {t('transportVehicle.addVehicle')}
        </Button>
      }
    >
      <View style={{ gap: 10 }}>
        {s.transportVehicles.map((v) => (
          <View key={v.id} style={styles.card}>
            <View style={styles.iconTile}>
              <Icon name={vIcon(v.type)} size={22} color={colors.brandStrong} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text size={15} weight={700} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {t(typeKey(v.type))}
                </Text>
                <StatusBadge tone={v.pricing === 'free' ? 'success' : 'food'} dot={false} size="sm">
                  {v.pricing === 'free' ? t('transportVehicle.free') : v.fare || t('transportVehicle.paid')}
                </StatusBadge>
              </View>
              <Text size={12} mono color={colors.textMuted} style={{ marginTop: 2 }}>
                {v.plate}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Switch checked={v.available} onChange={(on) => s.updateVehicle(v.id, { available: on })} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable onPress={() => openEdit(v)} accessibilityLabel={t('transportVehicle.editVehicle')} accessibilityRole="button" style={styles.smallBtn}>
                  <Icon name="pencil" size={15} color={colors.textSecondary} />
                </Pressable>
                <Pressable onPress={() => s.removeVehicle(v.id)} accessibilityLabel={t('transportVehicle.deleteVehicle')} accessibilityRole="button" style={styles.smallBtn}>
                  <Icon name="trash-2" size={15} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        {s.transportVehicles.length === 0 && (
          <Text size={13} color={colors.textMuted} align="center" style={styles.empty}>
            {t('transportVehicle.empty')}
          </Text>
        )}
      </View>

      <BottomSheet
        open={!!editing}
        title={editing === 'new' ? t('transportVehicle.addVehicle') : t('transportVehicle.editVehicle')}
        onClose={() => setEditing(null)}
        footer={
          <Button fullWidth size="lg" disabled={!form.plate.trim()} onPress={save}>
            {editing === 'new' ? t('transportVehicle.addVehicle') : t('transportVehicle.saveChanges')}
          </Button>
        }
      >
        <View style={{ gap: space[4] }}>
          <Select
            label={t('transportVehicle.vehicleType')}
            value={form.type}
            onValueChange={(type) => setForm((f) => ({ ...f, type }))}
            options={vehicleTypeOptions}
          />
          <Input
            label={t('transportVehicle.plateNumber')}
            value={form.plate}
            onChangeText={(plate) => setForm((f) => ({ ...f, plate }))}
            placeholder={t('transportVehicle.platePlaceholder')}
            leftIcon={<Icon name="hash" size={18} color={colors.textMuted} />}
          />
          <View>
            <Text size={fontSize.sm} weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
              {t('transportVehicle.pricing')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Chip
                selected={form.pricing === 'free'}
                accent="brand"
                onPress={() => setForm((f) => ({ ...f, pricing: 'free' }))}
              >
                {t('transportVehicle.free')}
              </Chip>
              <Chip
                selected={form.pricing === 'paid'}
                accent="food"
                onPress={() => setForm((f) => ({ ...f, pricing: 'paid' }))}
              >
                {t('transportVehicle.paid')}
              </Chip>
            </View>
          </View>
          {form.pricing === 'paid' && (
            <Input
              label={t('transportVehicle.fare')}
              value={form.fare}
              onChangeText={(fare) => setForm((f) => ({ ...f, fare }))}
              placeholder={t('transportVehicle.farePlaceholder')}
              leftIcon={<Icon name="indian-rupee" size={18} color={colors.textMuted} />}
            />
          )}
          <View style={styles.availRow}>
            <Text variant="body" weight={600} style={{ flex: 1 }}>
              {t('transportVehicle.availableNow')}
            </Text>
            <Switch
              checked={form.available}
              onChange={(on) => setForm((f) => ({ ...f, available: on }))}
            />
          </View>
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { padding: space[4], backgroundColor: colors.surfaceSunken, borderRadius: radius.md },
  availRow: { flexDirection: 'row', alignItems: 'center' },
});
