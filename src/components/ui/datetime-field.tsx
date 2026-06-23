/**
 * DateTimeField — a labelled field that opens the native date + time picker.
 * Android shows a date dialog then a time dialog; iOS shows a combined spinner
 * in a modal. Matches the Input look. Uses @react-native-community/datetimepicker.
 */
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { colors, fontSize, radius } from '@/theme';
import { formatDateTime } from '@/utils/datetime';

import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

export interface DateTimeFieldProps {
  label?: string;
  hint?: string;
  value: Date;
  onChange: (d: Date) => void;
  minimumDate?: Date;
  accent?: string;
}

export function DateTimeField({ label, hint, value, onChange, minimumDate, accent = colors.textMuted }: DateTimeFieldProps) {
  // Android: 'date' then 'time'. iOS: a single modal.
  const [androidMode, setAndroidMode] = useState<'date' | 'time' | null>(null);
  const [iosOpen, setIosOpen] = useState(false);
  const draft = useRef(value);

  const open = () => {
    draft.current = value;
    if (Platform.OS === 'ios') setIosOpen(true);
    else setAndroidMode('date');
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) {
      setAndroidMode(null);
      return;
    }
    if (androidMode === 'date') {
      const d = new Date(draft.current);
      d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      draft.current = d;
      setAndroidMode('time');
    } else {
      const d = new Date(draft.current);
      d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      onChange(d);
      setAndroidMode(null);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text size={fontSize.sm} weight={600} color={colors.textSecondary}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 50,
          paddingHorizontal: 14,
          backgroundColor: colors.surfaceCard,
          borderWidth: 1.5,
          borderColor: colors.borderStrong,
          borderRadius: radius.md,
        }}
      >
        <Icon name="calendar-clock" size={18} color={accent} />
        <Text variant="body" weight={500} color={colors.textPrimary} style={{ flex: 1 }}>
          {formatDateTime(value.getTime())}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {hint && (
        <Text size={fontSize.caption} color={colors.textMuted}>
          {hint}
        </Text>
      )}

      {Platform.OS === 'android' && androidMode && (
        <DateTimePicker
          value={draft.current}
          mode={androidMode}
          onChange={onAndroidChange}
          minimumDate={androidMode === 'date' ? minimumDate : undefined}
        />
      )}

      <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
        <Pressable
          onPress={() => setIosOpen(false)}
          style={{ flex: 1, backgroundColor: colors.surfaceOverlay, justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surfaceCard,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              padding: 16,
            }}
          >
            <DateTimePicker
              value={value}
              mode="datetime"
              display="spinner"
              minimumDate={minimumDate}
              onChange={(_e, selected) => {
                if (selected) draft.current = selected;
              }}
            />
            <Button
              fullWidth
              size="lg"
              onPress={() => {
                onChange(draft.current);
                setIosOpen(false);
              }}
            >
              Done
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
