/**
 * PressableScale — a Pressable that scales down on press, matching the design
 * system's "buttons scale to 0.97 on press" motion. Uses the RN Animated API
 * (native driver) so it works without extra worklet configuration.
 *
 * The style is applied to the Pressable itself (an animated Pressable), so
 * layout props like `flex: 1` / `width` propagate to the actual touch target —
 * essential for buttons laid out in a row (e.g. Accept / Decline).
 */
import { type ReactNode, useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children?: ReactNode;
}

export function PressableScale({
  activeScale = 0.97,
  style,
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animate(activeScale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
