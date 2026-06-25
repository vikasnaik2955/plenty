/**
 * PhotoPicker — photo capture/picker. Tap to either take a photo with the
 * camera (for evidence that isn't already saved) or choose one from the
 * gallery; calls onPick(uri) on success.
 * Ported from the design system kit `ui_kits/plenty-app/kit.jsx` (PhotoPicker).
 */
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useT } from '@/i18n/use-t';
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
  /** Defaults to a localized "Add photo". */
  label?: string;
  /** Accent color when filled / for the placeholder icon. @default brand */
  accent?: string;
  /** Show the native crop/adjust editor after picking. Defaults on for circular (avatar) pickers. */
  allowsEditing?: boolean;
  /** Crop aspect ratio when editing, e.g. [1, 1] for a square profile photo. */
  aspect?: [number, number];
  style?: StyleProp<ViewStyle>;
}

export function PhotoPicker({
  value,
  onPick,
  shape = 'rect',
  size = 96,
  label,
  accent = colors.brand,
  allowsEditing,
  aspect,
  style,
}: PhotoPickerProps) {
  const t = useT();
  const resolvedLabel = label ?? t('photoPicker.addPhoto');
  const br = shape === 'circle' ? size / 2 : radius.md;
  // Circular (avatar) pickers crop to a square by default so the photo fits.
  const editing = allowsEditing ?? shape === 'circle';
  const cropAspect: [number, number] | undefined = aspect ?? (shape === 'circle' ? [1, 1] : undefined);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('photoPicker.cameraAccessTitle'), t('photoPicker.cameraAccessMessage'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8, allowsEditing: editing, aspect: cropAspect });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPick(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8, allowsEditing: editing, aspect: cropAspect });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPick(result.assets[0].uri);
    }
  };

  // Let the user take a fresh photo (evidence not in the gallery) or pick one.
  const choose = () => {
    Alert.alert(resolvedLabel, undefined, [
      { text: t('photoPicker.takePhoto'), onPress: takePhoto },
      { text: t('photoPicker.chooseFromGallery'), onPress: pickFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <Pressable
      onPress={choose}
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
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
            {resolvedLabel}
          </Text>
        </>
      )}
    </Pressable>
  );
}
