/**
 * AdmTransport — admin fleet management. Ported from AdminScreens.jsx
 * `AdmTransport`. Local `fleet` state seeded from the store's TRANSPORT data;
 * filter chips by vehicle type; add/edit/remove in a bottom sheet.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MessagesButton } from '@/components/messages-button';
import { NotificationsButton } from '@/components/notifications-button';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { formatRelative } from '@/utils/datetime';
import type { Transport } from '@/data/types';

const VEHICLE_TYPES = ['Two-wheeler', 'Auto rickshaw', 'Cargo van', 'Car'];

const vIcon = (type: string) =>
  type === 'Cargo van' ? 'truck' : type === 'Two-wheeler' ? 'bike' : type === 'Car' ? 'car' : 'caravan';

interface VehicleForm {
  type: string;
  plate: string;
  driver: string;
  status: 'AVAILABLE' | 'BUSY';
}

export default function AdmTransport() {
  const s = useApp();
  const [fleet, setFleet] = useState<Transport[]>(s.data.TRANSPORT);
  const [filter, setFilter] = useState('all');
  // vehicle object or 'new'
  const [editing, setEditing] = useState<Transport | 'new' | null>(null);
  const [form, setForm] = useState<VehicleForm>({
    type: 'Two-wheeler',
    plate: '',
    driver: '',
    status: 'AVAILABLE',
  });

  const toggle = (id: string) =>
    setFleet(
      fleet.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE', updatedAt: Date.now() }
          : t,
      ),
    );

  const openEdit = (v: Transport) => {
    setForm({ type: v.type, plate: v.plate, driver: v.driver, status: v.status });
    setEditing(v);
  };
  const openNew = () => {
    setForm({ type: 'Two-wheeler', plate: '', driver: 'Unassigned', status: 'AVAILABLE' });
    setEditing('new');
  };

  const save = () => {
    const at = Date.now();
    if (editing === 'new') {
      setFleet((f) => [...f, { id: 't' + at, ...form, updatedAt: at }]);
      s.showToast('Vehicle added', 'success');
    } else if (editing) {
      const id = editing.id;
      setFleet((f) => f.map((t) => (t.id === id ? { ...t, ...form, updatedAt: at } : t)));
      s.showToast('Vehicle updated', 'success');
    }
    setEditing(null);
  };

  const remove = () => {
    if (editing && editing !== 'new') {
      const id = editing.id;
      setFleet((f) => f.filter((t) => t.id !== id));
    }
    setEditing(null);
    s.showToast('Vehicle removed');
  };

  const counts = VEHICLE_TYPES.reduce<Record<string, number>>((m, ty) => {
    m[ty] = fleet.filter((v) => v.type === ty).length;
    return m;
  }, {});
  const filtered = filter === 'all' ? fleet : fleet.filter((v) => v.type === filter);
  const types = ['all', ...VEHICLE_TYPES.filter((ty) => counts[ty] > 0)];

  return (
    <Page
      nav={<RoleBottomNav role="admin" active="transport" />}
      header={
        <AppBar
          title="Transport"
          align="center"
          action={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <NotificationsButton tone="dark" />
              <MessagesButton tone="dark" />
              <IconButton accessibilityLabel="Add vehicle" variant="brand" onPress={openNew}>
                <Icon name="plus" size={20} color="#fff" />
              </IconButton>
            </View>
          }
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {types.map((ty) => (
          <Chip
            key={ty}
            accent="neutral"
            selected={filter === ty}
            leftIcon={
              ty !== 'all' ? (
                <Icon name={vIcon(ty)} size={15} color={filter === ty ? colors.textPrimary : colors.textSecondary} />
              ) : undefined
            }
            onPress={() => setFilter(ty)}
          >
            {ty === 'all' ? `All · ${fleet.length}` : `${ty} · ${counts[ty]}`}
          </Chip>
        ))}
      </ScrollView>

      <View style={{ gap: 10 }}>
        {filtered.map((t) => {
          const avail = t.status === 'AVAILABLE';
          return (
            <View key={t.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name={vIcon(t.type)} size={22} color={colors.textPrimary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text size={15} weight={700}>
                  {t.type}
                </Text>
                <Text mono size={12} color={colors.textMuted}>
                  {t.plate} · {t.driver}
                </Text>
                {t.updatedAt != null && (
                  <Text size={11} color={colors.textMuted} style={{ marginTop: 1 }}>
                    Updated {formatRelative(t.updatedAt)}
                  </Text>
                )}
              </View>
              <View style={styles.rowEnd}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    size={11}
                    weight={800}
                    color={avail ? colors.success : colors.warning}
                    style={{ marginBottom: 5 }}
                  >
                    {t.status}
                  </Text>
                  <Switch checked={avail} onChange={() => toggle(t.id)} />
                </View>
                <Pressable
                  onPress={() => openEdit(t)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit vehicle"
                  style={styles.editBtn}
                >
                  <Icon name="pencil" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          );
        })}
        {filtered.length === 0 && (
          <Text size={13} color={colors.textMuted} align="center" style={styles.empty}>
            No {filter} vehicles.
          </Text>
        )}
      </View>

      <BottomSheet
        open={!!editing}
        title={editing === 'new' ? 'Add vehicle' : 'Edit vehicle'}
        onClose={() => setEditing(null)}
        footer={
          <Button fullWidth size="lg" disabled={!form.plate.trim()} onPress={save}>
            {editing === 'new' ? 'Add vehicle' : 'Save changes'}
          </Button>
        }
      >
        <View style={{ gap: 14 }}>
          <Select
            label="Vehicle type"
            value={form.type}
            onValueChange={(value) => setForm((f) => ({ ...f, type: value }))}
            options={VEHICLE_TYPES.map((ty) => ({ value: ty, label: ty }))}
          />
          <Input
            label="Plate number"
            value={form.plate}
            onChangeText={(plate) => setForm((f) => ({ ...f, plate }))}
            placeholder="MH 02 AB 1234"
            leftIcon={<Icon name="hash" size={18} color={colors.textMuted} />}
          />
          <Input
            label="Driver"
            value={form.driver}
            onChangeText={(driver) => setForm((f) => ({ ...f, driver }))}
            placeholder="Name or Unassigned"
            leftIcon={<Icon name="user" size={18} color={colors.textMuted} />}
          />
          <Switch
            label="Available now"
            checked={form.status === 'AVAILABLE'}
            onChange={(v) => setForm((f) => ({ ...f, status: v ? 'AVAILABLE' : 'BUSY' }))}
          />
          {editing !== 'new' && (
            <Pressable onPress={remove} style={styles.removeBtn}>
              <Icon name="trash-2" size={16} color={colors.error} />
              <Text size={14} weight={700} color={colors.error}>
                Remove vehicle
              </Text>
            </Pressable>
          )}
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  filterScroll: { marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: space[2], paddingBottom: 4 },
  row: {
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
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: space[4],
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
  },
  removeBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
});
