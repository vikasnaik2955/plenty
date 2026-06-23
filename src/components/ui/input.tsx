/**
 * Input — labeled text/number field with hint, error, leading icon and trailing slot.
 * Ported from the design system `components/forms/Input.jsx`.
 *
 * NOTE: this component intentionally has NO focus useState. Re-rendering the
 * input subtree on focus/blur (combined with non-stable leftIcon elements) made
 * the New Architecture (Fabric) reconciler remount the native TextInput, which
 * caused focus to bounce between fields in a loop. The border is static; the
 * cursor + keyboard indicate focus. (Restore a focus ring only via an
 * imperative/Animated path that does not call setState.)
 */
import {
  type StyleProp,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius } from '@/theme';

import { Text } from './text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the border red and replaces the hint. */
  error?: string;
  /** Leading icon node. */
  leftIcon?: React.ReactNode;
  /** Trailing slot (icon, unit, action). */
  trailing?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  trailing,
  disabled = false,
  required = false,
  style,
  containerStyle,
  ...rest
}: InputProps) {
  const borderColor = error ? colors.error : colors.borderStrong;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
          {label}
          {required && <Text size={fontSize.sm} weight={600} color={colors.error}> *</Text>}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 50,
          paddingHorizontal: 14,
          backgroundColor: disabled ? colors.surfaceSunken : colors.surfaceCard,
          borderWidth: 1.5,
          borderColor,
          borderRadius: radius.md,
        }}
      >
        {leftIcon}
        <TextInput
          editable={!disabled}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.brand}
          autoComplete="off"
          importantForAutofill="no"
          style={[
            {
              flex: 1,
              minWidth: 0,
              height: '100%',
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: fontSize.body,
              fontWeight: '500',
              color: colors.textPrimary,
              padding: 0,
            },
            style,
          ]}
          {...rest}
        />
        {trailing}
      </View>
      {(error || hint) && (
        <Text size={fontSize.caption} color={error ? colors.error : colors.textMuted}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}
