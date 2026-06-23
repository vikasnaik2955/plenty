/**
 * RoleSelect — "Join as…". Ported from SharedScreens.jsx `RoleSelect`.
 * Picking a role routes to auth (matches prototype's enterRole(role, viaAuth)).
 */
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Page } from '@/components/ui/page';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { ROLES } from '@/navigation/roles-meta';
import { useApp } from '@/store/app-store';
import { colors, radius, shadows, space } from '@/theme';

export default function RolesScreen() {
  const router = useRouter();
  const { setPendingRole } = useApp();

  const pick = (key: (typeof ROLES)[number]['key']) => {
    setPendingRole(key);
    router.push('/auth');
  };

  return (
    <Page>
      <View style={{ paddingTop: space[3] }}>
        <Text variant="h2">Join as…</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.sub}>
          Choose how you&apos;d like to use Plenty. You can switch anytime.
        </Text>
        <View style={{ gap: space[3] }}>
          {ROLES.map((r) => (
            <PressableScale key={r.key} onPress={() => pick(r.key)} style={styles.card}>
              <View style={[styles.iconTile, { backgroundColor: r.soft }]}>
                <Icon name={r.icon} size={26} color={r.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="lg" weight={700}>
                  {r.label}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {r.desc}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.textMuted} />
            </PressableScale>
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: space[1], marginBottom: space[5] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
