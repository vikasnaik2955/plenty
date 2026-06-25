/**
 * Language — choose the app language. The preference is saved to the store and
 * reflected on the profile. (Full string translation/i18n can be layered on top
 * of this preference later; this screen makes the selection real and persistent.)
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

const LANGUAGES: { name: string; native: string }[] = [
  { name: 'English', native: 'English' },
  { name: 'Hindi', native: 'हिन्दी' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const s = useApp();
  const t = useT();

  const choose = (name: string) => {
    s.setLanguage(name);
    s.showToast(t('language.setTo', { name }), 'success');
    router.back();
  };

  return (
    <Page header={<AppBar title={t('language.title')} onBack={() => router.back()} />}>
      <Text variant="caption" color={colors.textMuted} style={{ marginBottom: space[3] }}>
        {t('language.subtitle')}
      </Text>
      <View style={styles.card}>
        {LANGUAGES.map((l, i) => {
          const selected = s.language === l.name;
          return (
            <Pressable
              key={l.name}
              onPress={() => choose(l.name)}
              accessibilityRole="button"
              style={[styles.row, i < LANGUAGES.length - 1 && styles.rowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="body" weight={selected ? 700 : 600}>
                  {l.native}
                </Text>
                {l.native !== l.name && (
                  <Text variant="caption" color={colors.textMuted}>
                    {l.name}
                  </Text>
                )}
              </View>
              {selected && <Icon name="check" size={20} color={colors.brandStrong} />}
            </Pressable>
          );
        })}
      </View>
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
    paddingHorizontal: space[4],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
});
