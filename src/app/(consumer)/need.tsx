/**
 * Consumer Need — register / update the recipient's current need. Ported from
 * ConsumerScreens.jsx `ConNeed`. Sub-flow (AppBar back, no bottom nav).
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, fontSize } from '@/theme';

export default function ConNeed() {
  const router = useRouter();
  const t = useT();
  const s = useApp();
  const [prefs, setPrefs] = useState<string[]>(['food']);

  const toggle = (k: string) =>
    setPrefs(prefs.includes(k) ? prefs.filter((x) => x !== k) : [...prefs, k]);

  const save = () => {
    s.markNeedUpdated();
    s.showToast(t('conNeed.needUpdated'), 'success');
    router.back();
  };

  return (
    <Page
      header={<AppBar title={t('conNeed.title')} onBack={() => router.back()} />}
      footer={
        <Button fullWidth size="lg" onPress={save}>
          {t('conNeed.saveNeed')}
        </Button>
      }
    >
      <View style={styles.form}>
        <Input
          label={t('conNeed.placeOrg')}
          defaultValue="Hope Shelter"
          leftIcon={<Icon name="building-2" size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('conNeed.numberOfPeople')}
          defaultValue="40"
          required
          keyboardType="number-pad"
          leftIcon={<Icon name="users" size={18} color={colors.textMuted} />}
        />
        <View>
          <Text size={fontSize.sm} weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
            {t('conNeed.categoryPreference')}
          </Text>
          <View style={styles.chips}>
            <Chip
              selected={prefs.includes('food')}
              accent="food"
              leftIcon={<Icon name="utensils" size={15} color={prefs.includes('food') ? colors.food : colors.textSecondary} />}
              onPress={() => toggle('food')}
            >
              {t('conNeed.food')}
            </Chip>
            <Chip
              selected={prefs.includes('clothes')}
              accent="clothes"
              leftIcon={<Icon name="shirt" size={15} color={prefs.includes('clothes') ? colors.clothes : colors.textSecondary} />}
              onPress={() => toggle('clothes')}
            >
              {t('conNeed.clothes')}
            </Chip>
          </View>
        </View>
        <Input
          label={t('conNeed.contact')}
          defaultValue="+91 98990 11020"
          keyboardType="phone-pad"
          leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
        />
        <Textarea
          label={t('conNeed.notesForDonors')}
          maxLength={140}
          placeholder={t('conNeed.notesPlaceholder')}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  form: { flexDirection: 'column', gap: 16 },
  chips: { flexDirection: 'row', gap: 10 },
});
