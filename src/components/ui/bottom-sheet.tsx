/**
 * BottomSheet — modal with overlay scrim, drag handle, and slide-up sheet.
 * Honors the safe-area bottom inset.
 * Ported from the design system `components/feedback/BottomSheet.jsx`.
 */
import { Modal, Pressable, ScrollView, type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface BottomSheetProps {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  /** Pinned footer area, usually the primary Button. */
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function BottomSheet({ open, title, onClose, children, footer, style }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: colors.surfaceOverlay, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              width: '100%',
              backgroundColor: colors.surfaceCard,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              paddingTop: 10,
              paddingHorizontal: 20,
              paddingBottom: 20 + insets.bottom,
              maxHeight: '90%',
            },
            shadows.xl,
            style,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderStrong,
              alignSelf: 'center',
              marginTop: 4,
              marginBottom: 14,
            }}
          />
          {title && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <Text variant="h3" weight={700} color={colors.textPrimary}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceSunken,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="x" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
          {footer && <View style={{ marginTop: 18 }}>{footer}</View>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
