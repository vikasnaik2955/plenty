/**
 * Help & support — contact options (chat / email / call), an expandable FAQ,
 * and app info. Shared by every role.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';

const SUPPORT_EMAIL = 'support@plenty.app';
const SUPPORT_PHONE = '+91 98000 12345';

const FAQ_IDS = ['donate', 'delivers', 'track', 'shelters', 'rewards'];

export default function HelpScreen() {
  const router = useRouter();
  const t = useT();
  const s = useApp();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Page header={<AppBar title={t('help.title')} onBack={() => router.back()} />}>
      <Text variant="sm" weight={800} style={styles.section}>
        {t('help.contactUs')}
      </Text>
      <View style={styles.card}>
        <ContactRow
          icon="message-circle"
          label={t('help.chatLabel')}
          sub={t('help.chatSub')}
          onPress={() =>
            router.push({ pathname: '/chat', params: { name: 'Plenty Support', phone: SUPPORT_PHONE } })
          }
          first
        />
        <ContactRow
          icon="mail"
          label={t('help.emailLabel')}
          sub={SUPPORT_EMAIL}
          onPress={() =>
            Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Plenty%20support`).catch(() =>
              s.showToast(t('help.noEmailApp'), 'error'),
            )
          }
        />
        <ContactRow icon="phone" label={t('help.callLabel')} sub={SUPPORT_PHONE} onPress={() => callNumber(SUPPORT_PHONE)} last />
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        {t('help.faqHeading')}
      </Text>
      <View style={styles.card}>
        {FAQ_IDS.map((id, i) => {
          const isOpen = open === i;
          return (
            <View key={id} style={i < FAQ_IDS.length - 1 && styles.faqBorder}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : i)}
                accessibilityRole="button"
                style={styles.faqHead}
              >
                <Text variant="body" weight={600} style={{ flex: 1 }}>
                  {t(`help.faq.${id}.q`)}
                </Text>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {isOpen && (
                <Text variant="sm" color={colors.textSecondary} style={styles.faqBody}>
                  {t(`help.faq.${id}.a`)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        {t('help.aboutHeading')}
      </Text>
      <View style={[styles.card, styles.aboutCard]}>
        <Text variant="body" weight={700}>
          Plenty
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {t('help.tagline')}
        </Text>
      </View>
    </Page>
  );
}

function ContactRow({
  icon,
  label,
  sub,
  onPress,
  first,
  last,
}: {
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.contactRow, !last && styles.faqBorder, first && { paddingTop: space[3] + 2 }]}
    >
      <View style={styles.iconTile}>
        <Icon name={icon} size={20} color={colors.brandStrong} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" weight={700}>
          {label}
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {sub}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: space[2], marginBottom: space[2] },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: space[4],
    marginBottom: space[4],
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] + 2 },
  faqBody: { paddingBottom: space[3] + 2, lineHeight: 20 },
  aboutCard: { paddingVertical: space[4], gap: 2 },
});
