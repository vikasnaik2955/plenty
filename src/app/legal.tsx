/**
 * Safety & Trust — Plenty's role/liability disclaimer plus safety guidance.
 * Plenty is a platform that connects givers, volunteers and recipients; it
 * doesn't take custody of donations and isn't liable for user conduct. Reached
 * from Help and linked from the auth screen footer.
 */
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

const SUPPORT_EMAIL = 'support@plenty.app';
const TIP_KEYS = ['legal.tip1', 'legal.tip2', 'legal.tip3', 'legal.tip4'];

export default function LegalScreen() {
  const router = useRouter();
  const t = useT();
  const s = useApp();

  return (
    <Page header={<AppBar title={t('legal.title')} onBack={() => router.back()} />}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="shield-check" size={22} color={colors.brandStrong} />
        </View>
        <Text variant="sm" color={colors.textSecondary} style={{ flex: 1, lineHeight: 20 }}>
          {t('legal.intro')}
        </Text>
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        {t('legal.safetyTitle')}
      </Text>
      <View style={styles.card}>
        {TIP_KEYS.map((k, i) => (
          <View key={k} style={[styles.tip, i < TIP_KEYS.length - 1 && styles.tipBorder]}>
            <Icon name="check" size={16} color={colors.brandStrong} />
            <Text variant="body" color={colors.textPrimary} style={{ flex: 1, lineHeight: 21 }}>
              {t(k)}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        {t('legal.disclaimerTitle')}
      </Text>
      <View style={[styles.card, styles.pad]}>
        <Text variant="sm" color={colors.textSecondary} style={{ lineHeight: 21 }}>
          {t('legal.disclaimer')}
        </Text>
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        {t('legal.termsTitle')}
      </Text>
      <View style={[styles.card, styles.pad]}>
        <Text variant="sm" color={colors.textSecondary} style={{ lineHeight: 21 }}>
          {t('legal.termsBody')}
        </Text>
      </View>

      <Button
        variant="secondary"
        fullWidth
        leftIcon="mail"
        style={{ marginTop: space[2] }}
        onPress={() =>
          Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Plenty%20safety`).catch(() =>
            s.showToast(t('help.noEmailApp'), 'error'),
          )
        }
      >
        {t('legal.contactBtn')}
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: space[2],
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: space[3], marginBottom: space[2] },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
    marginBottom: space[2],
  },
  pad: { paddingVertical: space[3] + 2 },
  tip: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start', paddingVertical: space[3] },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
});
