/**
 * Messages — the dedicated chat section (conversation list), available to every
 * role. Shows all conversations involving the current account, newest first,
 * with last-message preview and unread badges. Tapping opens the thread.
 */
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';
import { conversationsFor } from '@/utils/chat';
import { formatRelative } from '@/utils/datetime';

export default function MessagesScreen() {
  const router = useRouter();
  const s = useApp();
  const me = s.role ? s.profiles[s.role].name : '';

  const conversations = conversationsFor(me, s.threads, s.threadReads);

  // Best-effort phone lookup so the chat's Call button works.
  const phoneFor = (name: string): string => {
    const v = s.data.VOLUNTEERS.find((x) => x.name === name);
    if (v) return v.contact;
    const d = s.data.DONORS.find((x) => x.name === name);
    if (d) return d.contact;
    const c = s.data.CONSUMERS.find((x) => x.name === name);
    if (c) return c.contact;
    const t = s.team.find((x) => x.name === name);
    return t?.contact ?? '';
  };

  return (
    <Page header={<AppBar title="Messages" onBack={() => router.back()} />}>
      {conversations.length === 0 ? (
        <EmptyState
          icon="message-circle"
          title="No messages yet"
          message="Message a volunteer, donor, or team member and your conversations will show up here."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {conversations.map((c) => (
            <Pressable
              key={c.other}
              onPress={() =>
                router.push({ pathname: '/chat', params: { name: c.other, phone: phoneFor(c.other) } })
              }
              accessibilityRole="button"
              style={styles.row}
            >
              <Avatar name={c.other} accent="brand" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.titleRow}>
                  <Text variant="body" weight={700} numberOfLines={1} style={{ flex: 1 }}>
                    {c.other}
                  </Text>
                  {c.lastMessage && (
                    <Text size={11} color={colors.textMuted}>
                      {formatRelative(c.lastMessage.at)}
                    </Text>
                  )}
                </View>
                <View style={styles.previewRow}>
                  <Text
                    variant="sm"
                    color={c.unread > 0 ? colors.textPrimary : colors.textMuted}
                    weight={c.unread > 0 ? 600 : 400}
                    numberOfLines={1}
                    style={{ flex: 1 }}
                  >
                    {c.lastMessage
                      ? `${c.lastMessage.from === me ? 'You: ' : ''}${c.lastMessage.text}`
                      : ''}
                  </Text>
                  {c.unread > 0 && (
                    <View style={styles.badge}>
                      <Text size={11} weight={800} color="#fff">
                        {c.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
