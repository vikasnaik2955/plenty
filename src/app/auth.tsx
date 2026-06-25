/**
 * Auth — log in / register for the chosen role. Ported from SharedScreens.jsx
 * `Auth`. Submitting enters the role and replaces to its home (prototype's
 * enterRole(pendingRole, false)).
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { ROLE_HOME } from '@/navigation/navs';
import { ROLES } from '@/navigation/roles-meta';
import { useApp } from '@/store/app-store';
import { colors, radius, space } from '@/theme';

export default function AuthScreen() {
  const router = useRouter();
  const t = useT();
  const { pendingRole, setRole } = useApp();
  const [mode, setMode] = useState('login');

  const role = ROLES.find((r) => r.key === pendingRole) ?? ROLES[0];

  const submit = () => {
    setRole(role.key);
    router.replace(ROLE_HOME[role.key]);
  };

  return (
    <Page
      header={<AppBar title="" onBack={() => router.back()} transparent />}
      footer={
        <Button fullWidth size="lg" onPress={submit}>
          {mode === 'login' ? t('auth.logIn') : t('auth.createAccount')}
        </Button>
      }
    >
      <View style={styles.head}>
        <View style={[styles.roleTile, { backgroundColor: role.soft }]}>
          <Icon name={role.icon} size={28} color={role.accent} />
        </View>
        <Text variant="h2">
          {mode === 'login'
            ? t('auth.welcomeBack')
            : t('auth.joinAs', { role: t(`role.${role.key}`) })}
        </Text>
      </View>

      <Tabs
        active={mode}
        onChange={setMode}
        items={[
          { key: 'login', label: t('auth.logIn') },
          { key: 'register', label: t('auth.register') },
        ]}
        style={{ marginBottom: space[4] }}
      />

      <View style={{ gap: space[4] }}>
        {mode === 'register' && (
          <Input label={t('auth.fullName')} placeholder={t('auth.fullNamePlaceholder')} leftIcon={<Icon name="user" size={18} color={colors.textMuted} />} />
        )}
        <Input
          label={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          defaultValue="asha@example.com"
          leftIcon={<Icon name="mail" size={18} color={colors.textMuted} />}
        />
        <Input
          label={t('auth.password')}
          secureTextEntry
          defaultValue="password"
          leftIcon={<Icon name="lock" size={18} color={colors.textMuted} />}
        />
        {mode === 'register' && (
          <Input
            label={t('auth.contactNumber')}
            placeholder="+91"
            keyboardType="phone-pad"
            leftIcon={<Icon name="phone" size={18} color={colors.textMuted} />}
          />
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginBottom: space[5] },
  roleTile: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
});
