/**
 * Select — labeled dropdown. Web used a native <select>; RN has no equivalent,
 * so this is a Pressable that opens a Modal list. Same label/hint/error layout
 * and the `options=[{value,label}]` API.
 * Ported from the design system `components/forms/Select.jsx`.
 */
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  /** Options as data. */
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  value,
  onValueChange,
  containerStyle,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const borderColor = error ? colors.error : focus || open ? colors.brand : colors.borderStrong;

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder ?? '';
  const isPlaceholder = !selected;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
          {label}
          {required && <Text size={fontSize.sm} weight={600} color={colors.error}> *</Text>}
        </Text>
      )}
      <Pressable
        disabled={disabled}
        onPress={() => {
          setOpen(true);
          setFocus(true);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 50,
          paddingLeft: 14,
          paddingRight: 14,
          backgroundColor: disabled ? colors.surfaceSunken : colors.surfaceCard,
          borderWidth: 1.5,
          borderColor,
          borderRadius: radius.md,
        }}
      >
        <Text
          variant="body"
          weight={500}
          color={isPlaceholder ? colors.textMuted : colors.textPrimary}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {displayLabel}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {(error || hint) && (
        <Text size={fontSize.caption} color={error ? colors.error : colors.textMuted}>
          {error || hint}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => { setOpen(false); setFocus(false); }}>
        <Pressable
          onPress={() => {
            setOpen(false);
            setFocus(false);
          }}
          style={{ flex: 1, backgroundColor: colors.surfaceOverlay, justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                backgroundColor: colors.surfaceCard,
                borderRadius: radius.lg,
                paddingVertical: 8,
                maxHeight: '70%',
              },
              shadows.xl,
            ]}
          >
            {label && (
              <Text variant="lg" weight={700} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                {label}
              </Text>
            )}
            <ScrollView>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onValueChange?.(o.value);
                      setOpen(false);
                      setFocus(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: active ? colors.brandSoft : 'transparent',
                    }}
                  >
                    <Text
                      variant="body"
                      weight={active ? 700 : 500}
                      color={active ? colors.brandStrong : colors.textPrimary}
                    >
                      {o.label}
                    </Text>
                    {active && <Icon name="check" size={18} color={colors.brandStrong} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
