/**
 * Root layout — loads fonts, mounts global providers, and hosts the navigation
 * Stack. Splash / role-select / auth sit at the root; each role is a tab group.
 */
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import { ErrorBoundary } from '@/components/error-boundary';
import { ToastHost } from '@/components/toast-host';
import { AppProvider } from '@/store/app-store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: colors.surfacePage }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.surfacePage },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'fade' }} />
                <Stack.Screen name="roles" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
                <Stack.Screen name="chat" />
                <Stack.Screen name="messages" />
                <Stack.Screen name="track-map" />
                <Stack.Screen name="delivery" />
                <Stack.Screen name="deliveries" />
                <Stack.Screen name="addresses" />
                <Stack.Screen name="language" />
                <Stack.Screen name="help" />
                <Stack.Screen name="(donor)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(volunteer)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(consumer)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
                <Stack.Screen name="(transport)" options={{ animation: 'fade' }} />
              </Stack>
              <ToastHost />
            </View>
            <StatusBar style="auto" />
          </ErrorBoundary>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
