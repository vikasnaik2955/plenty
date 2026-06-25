/**
 * Profile — shared across donor / volunteer / consumer tabs. Ported from
 * SharedScreens.jsx `Profile`. Edit sheet uses the native PhotoPicker.
 */
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { shareImpact } from '@/utils/share';
import type { Role } from '@/data/types';

export function ProfileScreen({ role }: { role: Role }) {
  const router = useRouter();
  const t = useT();
  const s = useApp();
  const { profiles, updateProfile, showToast } = s;
  const p = profiles[role];

  const defaultAddress = s.addresses.find((a) => a.isDefault) ?? s.addresses[0];
  const settings = [
    {
      icon: 'map-pin',
      label: t('profile.savedAddresses'),
      value: defaultAddress?.label,
      onPress: () => router.push('/addresses'),
    },
    { icon: 'globe', label: t('profile.language'), value: s.language, onPress: () => router.push('/language') },
    { icon: 'circle-help', label: t('profile.helpSupport'), onPress: () => router.push('/help') },
    { icon: 'share-2', label: t('share.button'), onPress: () => shareImpact(t, role) },
  ];

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(p.name);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(p.photo);

  useEffect(() => {
    setDraftName(p.name);
    setDraftPhoto(p.photo);
  }, [p.name, p.photo, editing]);

  const save = () => {
    updateProfile(role, { name: draftName, photo: draftPhoto });
    setEditing(false);
    showToast(t('profile.toastUpdated'), 'success');
  };

  return (
    <Page
      nav={<RoleBottomNav role={role} active="profile" />}
      header={
        <AppBar
          title={t('profile.title')}
          align="center"
          action={
            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
              <Text variant="sm" weight={700} color={colors.brandStrong}>
                {t('common.edit')}
              </Text>
            </Pressable>
          }
        />
      }
    >
      <View style={styles.head}>
        <Avatar name={p.name} src={p.photo ?? undefined} size="xl" accent="brand" />
        <Text variant="h3" weight={800} style={{ marginTop: space[3] }}>
          {p.name}
        </Text>
        <Text variant="caption" color={colors.textMuted} style={{ textTransform: 'capitalize' }}>
          {t(`role.${role}`)} · {p.sub}
        </Text>
      </View>

      <View style={styles.card}>
        <Row icon="user" label={t('profile.editProfile')} onPress={() => setEditing(true)} first />
        <Row icon="history" label={t('profile.deliveryHistory')} onPress={() => router.push('/deliveries')} />
        {settings.map((it, i) => (
          <Row
            key={it.label}
            icon={it.icon}
            label={it.label}
            value={it.value}
            last={i === settings.length - 1}
            onPress={it.onPress}
          />
        ))}
      </View>

      <View style={[styles.card, styles.pushRow]}>
        <Icon name="bell" size={20} color={colors.textSecondary} />
        <Text variant="body" weight={600} style={{ flex: 1 }}>
          {t('profile.pushNotifications')}
        </Text>
        <Switch checked={s.pushEnabled} onChange={s.setPushEnabled} />
      </View>

      <Button variant="secondary" fullWidth leftIcon="repeat" onPress={() => router.replace('/roles')}>
        {t('profile.switchRole')}
      </Button>

      <BottomSheet
        open={editing}
        title={t('profile.editProfile')}
        onClose={() => setEditing(false)}
        footer={
          <Button fullWidth size="lg" disabled={!draftName.trim()} onPress={save}>
            {t('profile.saveChanges')}
          </Button>
        }
      >
        <View style={{ alignItems: 'center', gap: space[2], marginBottom: space[4] }}>
          <PhotoPickerCircle value={draftPhoto} onPick={setDraftPhoto} />
          <Text variant="caption" color={colors.textMuted} weight={600}>
            {t('profile.tapToChoose')}
          </Text>
        </View>
        <Input
          label={t('profile.displayName')}
          value={draftName}
          onChangeText={setDraftName}
          leftIcon={<Icon name="user" size={18} color={colors.textMuted} />}
        />
      </BottomSheet>
    </Page>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  first,
  last,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !last && styles.rowBorder, first && { paddingTop: space[3] }]}
    >
      <Icon name={icon} size={20} color={colors.textSecondary} />
      <Text variant="body" weight={600} style={{ flex: 1 }}>
        {label}
      </Text>
      {value && (
        <Text variant="caption" color={colors.textMuted}>
          {value}
        </Text>
      )}
      <Icon name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function PhotoPickerCircle({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (uri: string) => void;
}) {
  const t = useT();
  return (
    <PhotoPicker shape="circle" size={92} value={value ?? undefined} onPick={onPick} label={t('profile.photo')} />
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', paddingVertical: space[2] + space[4] - space[2] },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
    marginBottom: space[3] + 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3] + 1,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  pushRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] + 1 },
});
