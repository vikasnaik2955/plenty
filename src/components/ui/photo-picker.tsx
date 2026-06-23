/**
 * PhotoPicker — photo capture/picker. Tap to either take a photo with the
 * camera (for evidence that isn't already saved) or choose one from the
 * gallery; calls onPick(uri) on success.
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (PhotoPicker).
 */
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { Icon } from './icon';
import { Text } from './text';

export interface PhotoPickerProps {
  /** Current image URI (controlled). */
  value?: string;
  /** Called with the picked image URI. */
  onPick: (uri: string) => void;
  /** @default "rect" */
  shape?: 'rect' | 'circle';
  /** Size in px (height; width for circle). @default 96 */
  size?: number;
  /** @default "Add photo" */
  label?: string;
  /** Accent color when filled / for the placeholder icon. @default brand */
  accent?: string;
  style?: StyleProp<ViewStyle>;
}

export function PhotoPicker({
  value,
  onPick,
  shape = 'rect',
  size = 96,
  label = 'Add photo',
  accent = colors.brand,
  style,
}: PhotoPickerProps) {
  const br = shape === 'circle' ? size / 2 : radius.md;

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera permission to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPick(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPick(result.assets[0].uri);
    }
  };

  // Let the user take a fresh photo (evidence not in the gallery) or pick one.
  const choose = () => {
    Alert.alert(label, undefined, [
      { text: 'Take photo', onPress: takePhoto },
      { text: 'Choose from gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Pressable
      onPress={choose}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          width: shape === 'rect' ? '100%' : size,
          height: size,
          borderRadius: br,
          overflow: 'hidden',
          borderWidth: 1.5,
          borderStyle: value ? 'solid' : 'dashed',
          borderColor: value ? accent : colors.borderStrong,
          backgroundColor: value ? 'transparent' : colors.surfaceSunken,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        style,
      ]}
    >
      {value ? (
        <>
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <View
            style={{
              position: 'absolute',
              right: 6,
              bottom: 6,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: 'rgba(26,23,20,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="pencil" size={13} color="#fff" />
          </View>
        </>
      ) : (
        <>
          <Icon name="image-plus" size={shape === 'circle' ? 22 : 24} color={accent} />
          <Text size={12} weight={700} color={colors.textMuted}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
