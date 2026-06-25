/**
 * ShelterImagesPicker — add several location photos for a shelter / community.
 * Horizontal row of thumbnails (each removable) plus a dashed "add" tile.
 * Uses expo-image-picker with multiple selection.
 */
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { colors, radius } from '@/theme';

const TILE = 96;

export function ShelterImagesPicker({
  value,
  onChange,
  accent = colors.clothes,
  max = 6,
}: {
  value: string[];
  onChange: (uris: string[]) => void;
  accent?: string;
  max?: number;
}) {
  const t = useT();
  const remaining = Math.max(0, max - value.length);

  const takePhoto = async () => {
    if (remaining === 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('photoPicker.cameraAccessTitle'), t('photoPicker.cameraAccessMessage'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    onChange([...value, result.assets[0].uri].slice(0, max));
  };

  const pickFromGallery = async () => {
    if (remaining === 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uris = result.assets.map((a) => a.uri);
    onChange([...value, ...uris].slice(0, max));
  };

  const add = () => {
    if (remaining === 0) return;
    Alert.alert(t('shelterImages.addPhotos'), undefined, [
      { text: t('photoPicker.takePhoto'), onPress: takePhoto },
      { text: t('photoPicker.chooseFromGallery'), onPress: pickFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
    >
      {value.map((uri, i) => (
        <View key={`${uri}-${i}`} style={{ width: TILE, height: TILE }}>
          <Image
            source={{ uri }}
            style={{ width: TILE, height: TILE, borderRadius: radius.md }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => removeAt(i)}
            accessibilityRole="button"
            accessibilityLabel={t('shelterImages.removePhoto')}
            hitSlop={6}
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'rgba(26,23,20,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="x" size={14} color="#fff" />
          </Pressable>
        </View>
      ))}

      {remaining > 0 && (
        <Pressable
          onPress={add}
          accessibilityRole="button"
          accessibilityLabel={t('shelterImages.addLocationPhotos')}
          style={{
            width: TILE,
            height: TILE,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderStrong,
            backgroundColor: colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Icon name="image-plus" size={24} color={accent} />
          <Text size={12} weight={700} color={colors.textMuted}>
            {t('shelterImages.addPhotos')}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
