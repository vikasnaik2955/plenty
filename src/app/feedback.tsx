/**
 * Feedback — shared across all roles (reached from Profile). Pick one or more
 * categories, optionally rate the experience, and write a message. Submissions
 * are recorded in the store (mock; a real API plugs in behind the repository).
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, fontSize, space } from '@/theme';
import { requireFields } from '@/utils/validation';

// `id` is a stable English slug stored with the feedback; the chip label is
// translated per render.
const CATEGORIES = [
  { id: 'bug', key: 'feedback.cat.bug', icon: 'bug' },
  { id: 'feature', key: 'feedback.cat.feature', icon: 'lightbulb' },
  { id: 'ui', key: 'feedback.cat.ui', icon: 'palette' },
  { id: 'performance', key: 'feedback.cat.performance', icon: 'gauge' },
  { id: 'translation', key: 'feedback.cat.translation', icon: 'languages' },
  { id: 'delivery', key: 'feedback.cat.delivery', icon: 'truck' },
  { id: 'rewards', key: 'feedback.cat.rewards', icon: 'award' },
  { id: 'other', key: 'feedback.cat.other', icon: 'message-circle' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const t = useT();
  const s = useApp();

  const [cats, setCats] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  const toggle = (id: string) =>
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = () => {
    const ok = requireFields(
      [
        { value: cats, label: t('feedback.categoryLabel') },
        { value: message, label: t('feedback.messageLabel') },
      ],
      t,
    );
    if (!ok) return;
    s.submitFeedback({ categories: cats, message, rating: rating || undefined });
    router.back();
  };

  return (
    <Page
      header={<AppBar title={t('feedback.title')} onBack={() => router.back()} />}
      footer={
        <Button fullWidth size="lg" leftIcon="send" onPress={submit}>
          {t('feedback.submit')}
        </Button>
      }
    >
      <Text variant="caption" color={colors.textMuted} style={{ marginBottom: space[4], lineHeight: 13 * 1.5 }}>
        {t('feedback.subtitle')}
      </Text>

      <View style={{ gap: space[2] }}>
        <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
          {t('feedback.categoryLabel')}{' '}
          <Text size={fontSize.sm} weight={600} color={colors.error}>
            *
          </Text>
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {t('feedback.pickHint')}
        </Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const on = cats.includes(c.id);
            return (
              <Chip
                key={c.id}
                selected={on}
                accent="brand"
                leftIcon={<Icon name={c.icon} size={15} color={on ? colors.brandStrong : colors.textSecondary} />}
                onPress={() => toggle(c.id)}
              >
                {t(c.key)}
              </Chip>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space[2], marginTop: space[5] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
            {t('feedback.ratingLabel')}
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            · {t('feedback.ratingOptional')}
          </Text>
        </View>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setRating(n === rating ? 0 : n)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={String(n)}
            >
              <Icon name="star" size={30} color={n <= rating ? colors.reward : colors.borderStrong} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: space[5] }}>
        <Textarea
          label={t('feedback.messageLabel')}
          required
          value={message}
          onChangeText={setMessage}
          placeholder={t('feedback.messagePlaceholder')}
          maxLength={500}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stars: { flexDirection: 'row', gap: 8 },
});
