/**
 * TeamSection — a delivery team list with add/remove + call/chat, used to assign
 * multiple volunteers to a task. Donors use it on the track screen; volunteers
 * use it on their active task to pull in teammates.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { colors, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';
import type { TaskHelper } from '@/data/types';

export interface Candidate {
  id: string;
  name: string;
  contact?: string;
  hint?: string;
}

export function TeamSection({
  title,
  members,
  candidates,
  onAdd,
  onRemove,
  addLabel: addLabelProp,
}: {
  title: string;
  members: TaskHelper[];
  candidates: Candidate[];
  onAdd: (c: Candidate) => void;
  onRemove: (id: string) => void;
  addLabel?: string;
}) {
  const router = useRouter();
  const t = useT();
  const addLabel = addLabelProp ?? t('teamSection.addVolunteer');
  const [adding, setAdding] = useState(false);

  const chat = (name: string, phone?: string) =>
    router.push({ pathname: '/chat', params: { name, phone: phone ?? '' } });

  const memberIds = new Set(members.map((m) => m.id));
  const available = candidates.filter((c) => !memberIds.has(c.id));

  return (
    <>
      <SectionHeader title={`${title} · ${members.length}`} />
      <View style={{ gap: 10 }}>
        {members.map((m) => (
          <View key={m.id} style={styles.member}>
            <Avatar name={m.name} accent="brand" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size={15} weight={700} color={colors.textPrimary} numberOfLines={1}>
                {m.name}
              </Text>
              <Text size={12} color={colors.textMuted}>
                {t('teamSection.addedBy', { name: m.addedBy })}
              </Text>
            </View>
            <Pressable
              onPress={() => chat(m.name, m.contact)}
              accessibilityRole="button"
              accessibilityLabel={t('teamSection.messagePerson', { name: m.name })}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSunken }]}
            >
              <Icon name="message-circle" size={17} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => callNumber(m.contact)}
              accessibilityRole="button"
              accessibilityLabel={t('teamSection.callPerson', { name: m.name })}
              style={[styles.iconBtn, { backgroundColor: colors.brand }]}
            >
              <Icon name="phone" size={17} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => onRemove(m.id)}
              accessibilityRole="button"
              accessibilityLabel={t('teamSection.removePerson', { name: m.name })}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSunken }]}
            >
              <Icon name="x" size={17} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setAdding(true)}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          style={styles.addBtn}
        >
          <View style={styles.addIcon}>
            <Icon name="user-plus" size={20} color={colors.brandStrong} />
          </View>
          <Text variant="body" weight={700} color={colors.brandStrong}>
            {addLabel}
          </Text>
        </Pressable>
      </View>

      <BottomSheet open={adding} title={addLabel} onClose={() => setAdding(false)}>
        {available.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="sm" color={colors.textMuted} align="center">
              {t('teamSection.noneLeft')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {available.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  onAdd(c);
                  setAdding(false);
                }}
                accessibilityRole="button"
                style={styles.candidate}
              >
                <Avatar name={c.name} accent="brand" size="sm" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text size={14} weight={700} color={colors.textPrimary}>
                    {c.name}
                  </Text>
                  {c.hint && (
                    <Text size={12} color={colors.textMuted}>
                      {c.hint}
                    </Text>
                  )}
                </View>
                <Icon name="plus" size={18} color={colors.brandStrong} />
              </Pressable>
            ))}
          </View>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 12,
    ...shadows.sm,
  },
  iconBtn: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCard,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { padding: space[4], backgroundColor: colors.surfaceSunken, borderRadius: radius.md },
  candidate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: 12,
  },
});
