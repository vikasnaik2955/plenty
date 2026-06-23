/**
 * Textarea — multi-line text field with label, hint, error, and live char count.
 * Ported from the design system `components/forms/Textarea.jsx`.
 */
import { useState } from 'react';
import { type StyleProp, TextInput, View, type ViewStyle } from 'react-native';

import { colors, fontSize, leading, radius } from '@/theme';

import { Text } from './text';

export interface TextareaProps {
  label?: string;
  hint?: string;
  error?: string;
  rows?: number;
  /** Shows a live character counter when set. */
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Textarea({
  label,
  hint,
  error,
  rows = 4,
  maxLength,
  disabled = false,
  required = false,
  value,
  defaultValue,
  placeholder,
  onChangeText,
  containerStyle,
}: TextareaProps) {
  // No focus useState — a focus/blur re-render of the input subtree can remount
  // the native TextInput on Fabric and bounce focus. Border is static.
  const [count, setCount] = useState((value ?? defaultValue ?? '').length);
  const borderColor = error ? colors.error : colors.borderStrong;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
          {label}
          {required && <Text size={fontSize.sm} weight={600} color={colors.error}> *</Text>}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={rows}
        maxLength={maxLength}
        editable={!disabled}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.brand}
        textAlignVertical="top"
        autoComplete="off"
        importantForAutofill="no"
        onChangeText={(t) => {
          setCount(t.length);
          onChangeText?.(t);
        }}
        style={{
          minHeight: 44 * 1.4,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: disabled ? colors.surfaceSunken : colors.surfaceCard,
          borderWidth: 1.5,
          borderColor,
          borderRadius: radius.md,
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: fontSize.body,
          fontWeight: '500',
          lineHeight: fontSize.body * leading.normal,
          color: colors.textPrimary,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text size={fontSize.caption} color={error ? colors.error : colors.textMuted}>
          {error || hint || ''}
        </Text>
        {maxLength != null && (
          <Text size={fontSize.caption} color={colors.textMuted}>
            {count}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}
