/**
 * VolTeam — volunteer team tab. Ported from VolunteerScreens.jsx `VolTeam`.
 * Team roster + suggested nearby volunteers to add, and an "Add team member"
 * invite sheet.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { VolunteerCard } from '@/components/ui/volunteer-card';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, leading, radius, shadows, space } from '@/theme';
import { callNumber } from '@/utils/contact';
import type { Volunteer } from '@/data/types';

export default function VolTeam() {
  const router = useRouter();
  const t = useT();
  const s = useApp();

  const openChat = (v: Volunteer) =>
    router.push({ pathname: '/chat', params: { name: v.name, phone: v.contact ?? '' } });

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const nearby = s.suggestions.filter((v) => Number(v.distance) <= 15);

  const submit = () => {
    s.addMember({
      id: 'm' + Date.now(),
      name: name.trim(),
      trips: 0,
      // Source passed '—'; the Volunteer type requires numbers, so we use 0 and
      // hide the rating/distance in the card when 0 (see deviation note).
      rating: 0,
      distance: 0,
      contact: contact.trim(),
      status: 'AVAILABLE',
    });
    setAdding(false);
    setName('');
    setContact('');
  };

  return (
    <Page
      nav={<RoleBottomNav role="volunteer" active="team" />}
      header={
        <AppBar
          title={t('volTeam.title')}
          align="center"
          action={
            <Pressable onPress={() => setAdding(true)} hitSlop={8} accessibilityRole="button">
              <Text size={14} weight={700} color={colors.brandStrong}>
                {t('common.add')}
              </Text>
            </Pressable>
          }
        />
      }
    >
      <SectionHeader
        title={t('volTeam.teamMembers', { count: s.team.length })}
        style={{ marginTop: 4 }}
      />
      <View style={{ gap: 10 }}>
        {s.team.map((v) => (
          <VolunteerCard
            key={v.id}
            name={v.name}
            role={t('volTeam.tripsCount', { count: v.trips })}
            rating={v.rating ? v.rating : undefined}
            distance={v.distance ? v.distance : undefined}
            phone={v.contact}
            accent="brand"
            onMessage={() => openChat(v)}
            onCall={v.contact ? () => callNumber(v.contact) : undefined}
          />
        ))}
      </View>

      <SectionHeader title={t('volTeam.suggestedNearby')} />
      <Text
        variant="sm"
        color={colors.textSecondary}
        style={{ marginTop: -4, marginBottom: space[3], lineHeight: 13 * leading.normal }}
      >
        {t('volTeam.suggestedNearbyHint')}
      </Text>
      {nearby.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text variant="sm" color={colors.textMuted} align="center">
            {t('volTeam.noNearby')}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {nearby.map((v) => (
            <SuggestionRow key={v.id} volunteer={v} onAdd={() => s.addToTeam(v)} />
          ))}
        </View>
      )}

      <BottomSheet
        open={adding}
        title={t('volTeam.addMember')}
        onClose={() => setAdding(false)}
        footer={
          <Button fullWidth size="lg" disabled={!name.trim()} onPress={submit}>
            {t('volTeam.sendInvite')}
          </Button>
        }
      >
        <Text
          variant="body"
          color={colors.textSecondary}
          style={{ marginBottom: space[3] + 2, lineHeight: 14 * leading.normal }}
        >
          {t('volTeam.inviteBody')}
        </Text>
        <View style={{ gap: space[3] + 2 }}>
          <Input
            label={t('volTeam.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('volTeam.namePlaceholder')}
            leftIcon={<Icon name="user" size={18} color={colors.textMuted} />}
          />
          <Input
            label={t('volTeam.contactLabel')}
            value={contact}
            onChangeText={setContact}
            placeholder="+91"
            keyboardType="phone-pad"
            leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
          />
        </View>
      </BottomSheet>
    </Page>
  );
}

function SuggestionRow({ volunteer, onAdd }: { volunteer: Volunteer; onAdd: () => void }) {
  const t = useT();
  return (
    <View style={styles.suggRow}>
      <Avatar name={volunteer.name} accent="brand" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text size={15} weight={700} color={colors.textPrimary}>
          {volunteer.name}
        </Text>
        <View style={styles.suggMeta}>
          <View style={styles.metaItem}>
            <Icon name="star" size={12} color={colors.reward} />
            <Text size={12} color={colors.textSecondary}>
              {volunteer.rating}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="navigation" size={12} color={colors.textSecondary} />
            <Text size={12} color={colors.textSecondary}>
              {t('volTeam.kmAway', { distance: volunteer.distance })}
            </Text>
          </View>
        </View>
      </View>
      <Pressable onPress={onAdd} accessibilityRole="button" style={styles.addBtn}>
        <Icon name="user-plus" size={16} color={colors.brandStrong} />
        <Text size={14} weight={700} color={colors.brandStrong}>
          {t('common.add')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    padding: space[4],
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
  },
  suggRow: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  suggMeta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2, marginTop: 3 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
});
