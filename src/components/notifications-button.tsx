/**
 * NotificationsButton — header bell with an unread badge for the current role's
 * task notifications. `tone="light"` for colored hero headers, `"dark"` for app bars.
 */
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius } from '@/theme';

export function NotificationsButton({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const t = useT();
  const router = useRouter();
  const s = useApp();
  const me = s.role;
  const unread = me
    ? s.notifications.filter((n) => (!n.audience || n.audience.includes(me)) && n.unread).length
    : 0;

  const light = tone === 'light';

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0 ? t('notificationsButton.unread', { count: unread }) : t('notifications.title')
      }
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: light ? 'rgba(255,255,255,0.2)' : colors.surfaceSunken,
      }}
    >
      <Icon name="bell" size={20} color={light ? '#fff' : colors.textSecondary} />
      {unread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 4,
            borderRadius: 8,
            backgroundColor: colors.error,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: light ? 'transparent' : colors.surfaceCard,
          }}
        >
          <Text size={10} weight={800} color="#fff">
            {unread}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
