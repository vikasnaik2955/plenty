/**
 * Notifications — role-targeted updates about the ongoing task. Any update from
 * another role (volunteer accepted / picked up / delivered, transport offered or
 * confirmed, donor edited the donation, teammate joined…) shows up here for the
 * roles it concerns. Opening the screen marks them read.
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationCard } from '@/components/ui/notification-card';
import { Page } from '@/components/ui/page';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { space } from '@/theme';
import { formatRelative } from '@/utils/datetime';

export default function NotificationsScreen() {
  const t = useT();
  const router = useRouter();
  const s = useApp();
  const { markNotificationsRead } = s;
  const me = s.role;

  const list = s.notifications
    .filter((n) => me && (!n.audience || n.audience.includes(me)))
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

  // Mark this role's notifications read when the screen opens.
  useEffect(() => {
    if (me) markNotificationsRead(me);
  }, [me, markNotificationsRead]);

  return (
    <Page header={<AppBar title={t('notifications.title')} onBack={() => router.back()} />}>
      {list.length === 0 ? (
        <EmptyState icon="bell-off" title={t('notifications.emptyTitle')} message={t('notifications.emptyMessage')} />
      ) : (
        <View style={{ gap: space[2] + 2 }}>
          {list.map((n) => (
            <NotificationCard
              key={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              time={n.at != null ? formatRelative(n.at) : n.time}
              unread={n.unread}
            />
          ))}
        </View>
      )}
    </Page>
  );
}
