/**
 * Switch — binary on/off toggle (availability, preferences, settings).
 * Custom 48×28 track with an animated 22px thumb, brand-green when on.
 * Ported from the design system `components/forms/Switch.jsx`.
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { colors, palette, radius, shadows } from '@/theme';

import { Text } from './text';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Optional trailing label, makes the whole row tappable. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Switch({ checked = false, onChange, disabled = false, label, style }: SwitchProps) {
  const anim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: checked ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [checked, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const track = disabled ? palette.neutral200 : checked ? colors.brand : palette.neutral300;

  const toggle = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        {
          width: 48,
          height: 28,
          borderRadius: radius.full,
          backgroundColor: track,
          opacity: disabled ? 0.6 : 1,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            left: 3,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#fff',
            transform: [{ translateX }],
          },
          shadows.sm,
        ]}
      />
    </Pressable>
  );

  if (!label) return toggle;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' }}
    >
      {toggle}
      <Text variant="body" weight={600} color={colors.textPrimary}>
        {label}
      </Text>
    </Pressable>
  );
}
