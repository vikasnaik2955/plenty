/**
 * AdmAudit — admin audit log. Ported from AdminScreens.jsx `AdmAudit`.
 * Static activity feed: an icon tile plus the event text and who · time.
 */
import { StyleSheet, View } from 'react-native';

import { RoleBottomNav } from '@/components/role-bottom-nav';
import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import type { TFunction } from '@/i18n/use-t';
import { colors, radius, statusColors } from '@/theme';

const buildLog = (t: TFunction) => [
  {
    icon: 'check-circle',
    accent: colors.success,
    text: t('admAudit.allocationCompleted', { id: 'al2' }),
    who: 'Meera Nair',
    time: t('admAudit.minAgo', { count: 12 }),
  },
  {
    icon: 'truck',
    accent: colors.info,
    text: t('admAudit.vehicleSetAvailable', { plate: 'MH 02 CD 4490' }),
    who: t('admAudit.system'),
    time: t('admAudit.minAgo', { count: 38 }),
  },
  {
    icon: 'user-plus',
    accent: statusColors.accepted.fg,
    text: t('admAudit.volunteerOnboarded'),
    who: 'Daniel Joseph',
    time: t('admAudit.hoursAgo', { count: 2 }),
  },
  {
    icon: 'alert-triangle',
    accent: colors.warning,
    text: t('admAudit.requestUnassigned', { id: 'al6' }),
    who: t('admAudit.system'),
    time: t('admAudit.hoursAgo', { count: 3 }),
  },
  {
    icon: 'flag',
    accent: colors.food,
    text: t('admAudit.allocationPickedUp', { id: 'al1' }),
    who: 'Ravi Kumar',
    time: t('admAudit.hoursAgo', { count: 4 }),
  },
];

export default function AdmAudit() {
  const t = useT();
  const log = buildLog(t);
  return (
    <Page
      nav={<RoleBottomNav role="admin" active="audit" />}
      header={<AppBar title={t('admAudit.title')} align="center" />}
    >
      <View>
        {log.map((l, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.tile}>
              <Icon name={l.icon} size={18} color={l.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text size={14} weight={600} color={colors.textPrimary}>
                {l.text}
              </Text>
              <Text size={12} color={colors.textMuted}>
                {l.who} · {l.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
