/**
 * Chat — a conversation with one contact. Messages live in the shared store
 * keyed by participant names, so a message sent from one role's account shows
 * up on the other person's account when you switch roles (WhatsApp-style, no
 * backend). The header Call button opens the dialer.
 *
 * WhatsApp-style touches: a dismissible safety strip, swipe-right-to-reply with
 * a quoted preview, long-press-to-edit your own messages (never deletable).
 * Opened via `/chat?name=…&phone=…`.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useT, type TFunction } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, space } from '@/theme';
import { callNumber } from '@/utils/contact';
import { threadId } from '@/utils/chat';
import { dayKey, formatDayLabel, formatTime } from '@/utils/datetime';
import type { ChatMessage } from '@/data/types';

export default function ChatScreen() {
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = useApp();
  const params = useLocalSearchParams<{ name?: string; phone?: string }>();

  const { markThreadRead, sendMessage, editMessage } = s;
  const other = params.name || t('chat.contact');
  const phone = params.phone;
  const me = s.role ? s.profiles[s.role].name : t('chat.you');
  const tid = threadId(me, other);
  const messages = s.threads[tid] ?? [];

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  // Id of the message being edited (messages can be edited, never deleted).
  const [editingId, setEditingId] = useState<string | null>(null);
  // Message being replied to (swipe-to-reply).
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const scrollToEnd = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  useEffect(() => {
    markThreadRead(me, other);
  }, [me, other, messages.length, markThreadRead]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, (e) => {
      setKbHeight(e.endCoordinates.height);
      scrollToEnd();
    });
    const onHide = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const keyboardOpen = kbHeight > 0;
  const bottomSpace = keyboardOpen ? kbHeight : insets.bottom;

  const send = () => {
    if (!text.trim()) return;
    if (editingId) {
      editMessage(me, other, editingId, text);
      setEditingId(null);
    } else {
      const reply = replyingTo
        ? { from: replyingTo.from === me ? t('chat.you') : replyingTo.from, text: replyingTo.text }
        : undefined;
      sendMessage(me, other, text, reply);
      setReplyingTo(null);
    }
    setText('');
    scrollToEnd();
  };

  const startEdit = (m: ChatMessage) => {
    setReplyingTo(null);
    setEditingId(m.id);
    setText(m.text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };
  const startReply = (m: ChatMessage) => {
    setEditingId(null);
    setReplyingTo(m);
    inputRef.current?.focus();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfacePage }}>
      <AppBar
        title={other}
        subtitle={phone}
        onBack={() => router.back()}
        action={
          phone ? (
            <Pressable
              onPress={() => callNumber(phone)}
              accessibilityRole="button"
              accessibilityLabel={t('chat.callName', { name: other })}
              style={styles.callBtn}
            >
              <Icon name="phone" size={18} color="#fff" />
            </Pressable>
          ) : undefined
        }
      />

      {!s.chatSafetyDismissed && (
        <View style={styles.safetyStrip}>
          <Icon name="shield-check" size={16} color={colors.brandStrong} />
          <Text size={11.5} weight={600} color={colors.textSecondary} style={{ flex: 1, lineHeight: 11.5 * 1.4 }}>
            {t('chat.safety')}
          </Text>
          <Pressable onPress={s.dismissChatSafety} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.close')}>
            <Icon name="x" size={15} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: space[4], gap: space[2], flexGrow: 1, justifyContent: 'flex-end' }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: space[6] }}>
              <Text variant="sm" color={colors.textMuted} align="center">
                {t('chat.sayHello', { name: other })}
              </Text>
            </View>
          )}
          {messages.map((m, i) => {
            const showDay = i === 0 || dayKey(m.at) !== dayKey(messages[i - 1].at);
            return (
              <Fragment key={m.id}>
                {showDay && (
                  <View style={styles.daySepRow}>
                    <View style={styles.daySep}>
                      <Text size={11} weight={700} color={colors.textSecondary}>
                        {formatDayLabel(m.at)}
                      </Text>
                    </View>
                  </View>
                )}
                <MessageRow m={m} me={me} other={other} t={t} onReply={startReply} onEdit={startEdit} />
              </Fragment>
            );
          })}
        </ScrollView>

        {replyingTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBar} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size={12} weight={800} color={colors.brandStrong} numberOfLines={1}>
                {t('chat.replyingTo', { name: replyingTo.from === me ? t('chat.you') : replyingTo.from })}
              </Text>
              <Text size={12} color={colors.textSecondary} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.close')}>
              <Icon name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {editingId && (
          <View style={styles.editBanner}>
            <Icon name="pencil" size={15} color={colors.brandStrong} />
            <Text size={13} weight={700} color={colors.brandStrong} style={{ flex: 1 }}>
              {t('chat.editingMessage')}
            </Text>
            <Pressable onPress={cancelEdit} accessibilityRole="button" accessibilityLabel={t('chat.cancelEdit')} hitSlop={8}>
              <Icon name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={editingId ? t('chat.editPlaceholder') : t('chat.messagePlaceholder', { name: other })}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!text.trim()}
            accessibilityRole="button"
            accessibilityLabel={editingId ? t('chat.saveEdit') : t('chat.sendMessage')}
            style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.5 }]}
          >
            <Icon name={editingId ? 'check' : 'send'} size={18} color="#fff" />
          </Pressable>
        </View>
        {/* Spacer that lifts the input flush onto the keyboard (or above the nav bar). */}
        <View style={{ height: bottomSpace, backgroundColor: colors.surfaceCard }} />
      </View>
    </View>
  );
}

/** One message row — swipe right to reply; long-press your own to edit. */
function MessageRow({
  m,
  me,
  other,
  t,
  onReply,
  onEdit,
}: {
  m: ChatMessage;
  me: string;
  other: string;
  t: TFunction;
  onReply: (m: ChatMessage) => void;
  onEdit: (m: ChatMessage) => void;
}) {
  const mine = m.from === me;
  const swipeRef = useRef<Swipeable>(null);

  return (
    <View style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
      {!mine && <Avatar name={other} size="sm" accent="brand" style={{ marginRight: 8 }} />}
      <Swipeable
        ref={swipeRef}
        friction={2}
        leftThreshold={36}
        overshootLeft={false}
        renderLeftActions={() => (
          <View style={styles.replyAction}>
            <Icon name="reply" size={18} color={colors.brandStrong} />
          </View>
        )}
        onSwipeableWillOpen={() => {
          onReply(m);
          swipeRef.current?.close();
        }}
      >
        <Pressable
          onLongPress={mine ? () => onEdit(m) : undefined}
          delayLongPress={250}
          accessibilityLabel={mine ? t('chat.editMessage') : undefined}
          style={[styles.bubble, mine ? styles.mine : styles.theirs]}
        >
          {m.replyTo && (
            <View style={[styles.quote, mine ? styles.quoteMine : styles.quoteTheirs]}>
              <Text size={11} weight={800} color={mine ? '#fff' : colors.brandStrong} numberOfLines={1}>
                {m.replyTo.from}
              </Text>
              <Text size={12} color={mine ? 'rgba(255,255,255,0.85)' : colors.textSecondary} numberOfLines={1}>
                {m.replyTo.text}
              </Text>
            </View>
          )}
          <Text variant="body" color={mine ? '#fff' : colors.textPrimary}>
            {m.text}
          </Text>
          <View style={styles.metaRow}>
            {m.edited && (
              <Text size={10} color={mine ? 'rgba(255,255,255,0.75)' : colors.textMuted}>
                {t('chat.edited')} ·{' '}
              </Text>
            )}
            <Text size={10} color={mine ? 'rgba(255,255,255,0.75)' : colors.textMuted}>
              {formatTime(m.at)}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2] + 1,
    backgroundColor: colors.brandSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  daySepRow: { alignItems: 'center', marginVertical: space[2] },
  daySep: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSunken,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, alignSelf: 'flex-end' },
  replyAction: { width: 56, alignItems: 'center', justifyContent: 'center' },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    backgroundColor: colors.surfaceSunken,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  replyBar: { width: 3, alignSelf: 'stretch', minHeight: 28, backgroundColor: colors.brand, borderRadius: 2 },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    backgroundColor: colors.brandSoft,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 9 },
  mine: { backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  theirs: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: 4,
  },
  quote: {
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 4,
    marginBottom: 5,
  },
  quoteMine: { backgroundColor: 'rgba(255,255,255,0.18)', borderLeftColor: 'rgba(255,255,255,0.9)' },
  quoteTheirs: { backgroundColor: colors.surfaceSunken, borderLeftColor: colors.brand },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[2],
    paddingHorizontal: space[3],
    paddingTop: space[2],
    paddingBottom: space[2],
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePage,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
