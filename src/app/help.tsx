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
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';

const SUPPORT_EMAIL = 'support@plenty.app';
const SUPPORT_PHONE = '+91 98000 12345';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I donate food or clothes?',
    a: 'On the Home tab, tap "Donate something", pick Food or Clothes, fill the quick form, choose a nearby recipient, and confirm. A volunteer will be notified to pick it up.',
  },
  {
    q: 'Who delivers my donation?',
    a: 'A nearby volunteer accepts your request and handles pickup and delivery. You can add more volunteers to the delivery team, and transport providers can offer a free or paid ride.',
  },
  {
    q: 'Can I track my donation?',
    a: 'Yes — open the donation to see a live map, the status timeline with times, your volunteer and transport, and the progress photos uploaded at each step.',
  },
  {
    q: 'How are shelters and NGOs added?',
    a: 'Recipients don’t use the app — donors and volunteers register them via "Add a shelter or community", including location, photos, and the number of people.',
  },
  {
    q: 'Do I earn rewards?',
    a: 'Donors earn reward points for completed donations, visible on the Rewards tab.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const s = useApp();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Page header={<AppBar title="Help & support" onBack={() => router.back()} />}>
      <Text variant="sm" weight={800} style={styles.section}>
        Contact us
      </Text>
      <View style={styles.card}>
        <ContactRow
          icon="message-circle"
          label="Chat with support"
          sub="We usually reply within a few minutes"
          onPress={() =>
            router.push({ pathname: '/chat', params: { name: 'Plenty Support', phone: SUPPORT_PHONE } })
          }
          first
        />
        <ContactRow
          icon="mail"
          label="Email us"
          sub={SUPPORT_EMAIL}
          onPress={() =>
            Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Plenty%20support`).catch(() =>
              s.showToast('No email app found', 'error'),
            )
          }
        />
        <ContactRow icon="phone" label="Call us" sub={SUPPORT_PHONE} onPress={() => callNumber(SUPPORT_PHONE)} last />
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        Frequently asked
      </Text>
      <View style={styles.card}>
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <View key={f.q} style={i < FAQS.length - 1 && styles.faqBorder}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : i)}
                accessibilityRole="button"
                style={styles.faqHead}
              >
                <Text variant="body" weight={600} style={{ flex: 1 }}>
                  {f.q}
                </Text>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {isOpen && (
                <Text variant="sm" color={colors.textSecondary} style={styles.faqBody}>
                  {f.a}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <Text variant="sm" weight={800} style={styles.section}>
        About
      </Text>
      <View style={[styles.card, styles.aboutCard]}>
        <Text variant="body" weight={700}>
          Plenty
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          Share what&apos;s spare · version 1.0.0
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
