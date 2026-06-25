/**
 * Transport verification — the provider submits their name, driving licence
 * number + photo, and contact to get verified. A verified badge then unlocks
 * offering rides. (Approval is simulated since there's no backend.)
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { requireFields } from '@/utils/validation';

export default function TransportVerify() {
  const router = useRouter();
  const s = useApp();
  const t = useT();
  const v = s.transportVerification;

  const [fullName, setFullName] = useState(v.fullName);
  const [license, setLicense] = useState(v.license);
  const [contact, setContact] = useState(v.contact);
  const [photo, setPhoto] = useState<string | undefined>(v.licensePhoto);

  const submit = () => {
    const ok = requireFields(
      [
        { value: fullName, label: t('transportVerify.fullName') },
        { value: license.trim().length >= 6 ? 'ok' : '', label: t('transportVerify.licenseNumber') },
        { value: contact, label: t('transportVerify.contactNumber') },
      ],
      t,
    );
    if (!ok) return;
    s.submitVerification({
      fullName: fullName.trim(),
      license: license.trim(),
      contact: contact.trim(),
      licensePhoto: photo,
    });
    router.back();
  };

  const statusBadge =
    v.status === 'verified' ? (
      <StatusBadge tone="success" dot={false}>
        {t('transportVerify.statusVerified')}
      </StatusBadge>
    ) : v.status === 'pending' ? (
      <StatusBadge tone="warning" dot={false}>
        {t('transportVerify.statusUnderReview')}
      </StatusBadge>
    ) : (
      <StatusBadge tone="neutral" dot={false}>
        {t('transportVerify.statusNotVerified')}
      </StatusBadge>
    );

  return (
    <Page
      header={<AppBar title={t('transportVerify.title')} onBack={() => router.back()} />}
      footer={
        v.status === 'verified' ? (
          <Button fullWidth size="lg" variant="secondary" onPress={() => router.back()}>
            {t('common.done')}
          </Button>
        ) : (
          <Button fullWidth size="lg" leftIcon="shield-check" onPress={submit}>
            {v.status === 'pending' ? t('transportVerify.resubmit') : t('transportVerify.submit')}
          </Button>
        )
      }
    >
      <View style={[styles.banner, v.status === 'verified' && { backgroundColor: colors.successSoft }]}>
        <Icon
          name={v.status === 'verified' ? 'shield-check' : 'shield-alert'}
          size={22}
          color={v.status === 'verified' ? colors.success : colors.warning}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="body" weight={700}>
              {t('transportVerify.accountStatus')}
            </Text>
            {statusBadge}
          </View>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 17 }}>
            {v.status === 'verified'
              ? t('transportVerify.bannerVerified')
              : v.status === 'pending'
                ? t('transportVerify.bannerPending')
                : t('transportVerify.bannerUnverified')}
          </Text>
        </View>
      </View>

      <View style={{ gap: space[4], marginTop: space[4] }}>
        <Input
          label={t('transportVerify.fullName')}
          required
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('transportVerify.fullNamePlaceholder')}
          leftIcon={<Icon name="user" size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('transportVerify.licenseNumber')}
          required
          value={license}
          onChangeText={setLicense}
          placeholder={t('transportVerify.licenseNumberPlaceholder')}
          autoCapitalize="characters"
          leftIcon={<Icon name="id-card" size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('transportVerify.contactNumber')}
          required
          value={contact}
          onChangeText={setContact}
          placeholder={t('transportVerify.contactNumberPlaceholder')}
          keyboardType="phone-pad"
          leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
        />
        <View>
          <Text variant="sm" weight={600} color={colors.textSecondary} style={{ marginBottom: space[2] }}>
            {t('transportVerify.licensePhoto')}
          </Text>
          <PhotoPicker value={photo} onPick={setPhoto} size={120} label={t('transportVerify.uploadLicense')} />
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
});
