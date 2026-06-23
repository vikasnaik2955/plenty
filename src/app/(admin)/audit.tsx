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
import { colors, radius, statusColors } from '@/theme';

const LOG = [
  { icon: 'check-circle', accent: colors.success, text: 'Allocation #al2 completed', who: 'Meera Nair', time: '12 min ago' },
  { icon: 'truck', accent: colors.info, text: 'Vehicle MH 02 CD 4490 set Available', who: 'System', time: '38 min ago' },
  { icon: 'user-plus', accent: statusColors.accepted.fg, text: 'New volunteer onboarded', who: 'Daniel Joseph', time: '2 h ago' },
  { icon: 'alert-triangle', accent: colors.warning, text: 'Request #al6 unassigned > 30 min', who: 'System', time: '3 h ago' },
  { icon: 'flag', accent: colors.food, text: 'Allocation #al1 picked up', who: 'Ravi Kumar', time: '4 h ago' },
];

export default function AdmAudit() {
  return (
    <Page
      nav={<RoleBottomNav role="admin" active="audit" />}
      header={<AppBar title="Audit log" align="center" />}
    >
      <View>
        {LOG.map((l, i) => (
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
