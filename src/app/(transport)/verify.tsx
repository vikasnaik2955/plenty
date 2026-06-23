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
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

export default function TransportVerify() {
  const router = useRouter();
  const s = useApp();
  const v = s.transportVerification;

  const [fullName, setFullName] = useState(v.fullName);
  const [license, setLicense] = useState(v.license);
  const [contact, setContact] = useState(v.contact);
  const [photo, setPhoto] = useState<string | undefined>(v.licensePhoto);

  const valid = fullName.trim().length > 0 && license.trim().length >= 6 && contact.trim().length > 0;
  const submit = () => {
    if (!valid) return;
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
        Verified
      </StatusBadge>
    ) : v.status === 'pending' ? (
      <StatusBadge tone="warning" dot={false}>
        Under review
      </StatusBadge>
    ) : (
      <StatusBadge tone="neutral" dot={false}>
        Not verified
      </StatusBadge>
    );

  return (
    <Page
      header={<AppBar title="Verification" onBack={() => router.back()} />}
      footer={
        v.status === 'verified' ? (
          <Button fullWidth size="lg" variant="secondary" onPress={() => router.back()}>
            Done
          </Button>
        ) : (
          <Button fullWidth size="lg" leftIcon="shield-check" disabled={!valid} onPress={submit}>
            {v.status === 'pending' ? 'Resubmit' : 'Submit for verification'}
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
              Account status
            </Text>
            {statusBadge}
          </View>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 17 }}>
            {v.status === 'verified'
              ? 'You’re verified — donors and volunteers can trust your rides.'
              : v.status === 'pending'
                ? 'Your details are under review. We’ll verify you shortly.'
                : 'Verify your identity and licence to start offering rides.'}
          </Text>
        </View>
      </View>

      <View style={{ gap: space[4], marginTop: space[4] }}>
        <Input
          label="Full name"
          required
          value={fullName}
          onChangeText={setFullName}
          placeholder="As on your licence"
          leftIcon={<Icon name="user" size={18} color={colors.textMuted} />}
        />
        <Input
          label="Driving licence number"
          required
          value={license}
          onChangeText={setLicense}
          placeholder="e.g. MH14 20110012345"
          autoCapitalize="characters"
          leftIcon={<Icon name="id-card" size={18} color={colors.textMuted} />}
        />
        <Input
          label="Contact number"
          required
          value={contact}
          onChangeText={setContact}
          placeholder="+91"
          keyboardType="phone-pad"
          leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
        />
        <View>
          <Text variant="sm" weight={600} color={colors.textSecondary} style={{ marginBottom: space[2] }}>
            Driving licence photo
          </Text>
          <PhotoPicker value={photo} onPick={setPhoto} size={120} label="Upload licence" />
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
