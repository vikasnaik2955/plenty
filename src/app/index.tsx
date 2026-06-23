/**
 * Splash — branded entry. "Share what's spare." → Get started → role select.
 * Ported from SharedScreens.jsx `Splash`.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { palette, radius, space } from '@/theme';

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[palette.green500, palette.green700]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <StatusBar style="light" />
      <View style={styles.center}>
        <View style={styles.tile}>
          <BrandMark size={64} tile={false} />
        </View>
        <Text size={42} weight={800} color="#fff" style={styles.wordmark}>
          plenty
        </Text>
        <Text size={17} weight={500} color="#fff" align="center" style={styles.tagline}>
          Share what&apos;s spare. A neighbour nearby needs it today.
        </Text>
      </View>
      <View style={[styles.footer, { bottom: insets.bottom + space[6] }]}>
        <Button
          fullWidth
          size="lg"
          rightIcon="arrow-right"
          onPress={() => router.push('/roles')}
          style={styles.cta}
        >
          <Text size={17} weight={700} color={palette.green600}>
            Get started
          </Text>
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[8] },
  tile: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[6],
  },
  wordmark: { letterSpacing: -1.2 },
  tagline: { marginTop: space[2], maxWidth: 260, lineHeight: 24, opacity: 0.92 },
  footer: { position: 'absolute', left: space[6], right: space[6] },
  cta: { backgroundColor: '#fff' },
});
