/**
 * ToastHost — renders the app store's current toast as a rising snackbar near
 * the bottom of the screen. The store owns visibility + auto-dismiss; this is
 * the single global mount point (the prototype rendered it inside the frame).
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast } from '@/components/ui/toast';
import { useApp } from '@/store/app-store';

export function ToastHost() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: toast ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [toast, anim]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom: insets.bottom + 84 },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
            },
          ],
        },
      ]}
    >
      <Toast message={toast.message} tone={toast.tone} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 60,
  },
});
