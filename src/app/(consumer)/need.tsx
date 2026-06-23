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
import { useApp } from '@/store/app-store';
import { colors, fontSize } from '@/theme';

export default function ConNeed() {
  const router = useRouter();
  const s = useApp();
  const [prefs, setPrefs] = useState<string[]>(['food']);

  const toggle = (k: string) =>
    setPrefs(prefs.includes(k) ? prefs.filter((x) => x !== k) : [...prefs, k]);

  const save = () => {
    s.markNeedUpdated();
    s.showToast('Need updated', 'success');
    router.back();
  };

  return (
    <Page
      header={<AppBar title="Register need" onBack={() => router.back()} />}
      footer={
        <Button fullWidth size="lg" onPress={save}>
          Save need
        </Button>
      }
    >
      <View style={styles.form}>
        <Input
          label="Place / organization"
          defaultValue="Hope Shelter"
          leftIcon={<Icon name="building-2" size={18} color={colors.textMuted} />}
        />
        <Input
          label="Number of people"
          defaultValue="40"
          required
          keyboardType="number-pad"
          leftIcon={<Icon name="users" size={18} color={colors.textMuted} />}
        />
        <View>
          <Text size={fontSize.sm} weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
            Category preference
          </Text>
          <View style={styles.chips}>
            <Chip
              selected={prefs.includes('food')}
              accent="food"
              leftIcon={<Icon name="utensils" size={15} color={prefs.includes('food') ? colors.food : colors.textSecondary} />}
              onPress={() => toggle('food')}
            >
              Food
            </Chip>
            <Chip
              selected={prefs.includes('clothes')}
              accent="clothes"
              leftIcon={<Icon name="shirt" size={15} color={prefs.includes('clothes') ? colors.clothes : colors.textSecondary} />}
              onPress={() => toggle('clothes')}
            >
              Clothes
            </Chip>
          </View>
        </View>
        <Input
          label="Contact"
          defaultValue="+91 98990 11020"
          keyboardType="phone-pad"
          leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
        />
        <Textarea
          label="Notes for donors"
          maxLength={140}
          placeholder="We can receive deliveries between 11 AM and 9 PM."
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  form: { flexDirection: 'column', gap: 16 },
  chips: { flexDirection: 'row', gap: 10 },
});
