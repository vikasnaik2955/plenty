/**
 * ShelterImagesPicker — add several location photos for a shelter / community.
 * Horizontal row of thumbnails (each removable) plus a dashed "add" tile.
 * Uses expo-image-picker with multiple selection.
 */
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
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
  const remaining = Math.max(0, max - value.length);

  const add = async () => {
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
            accessibilityLabel="Remove photo"
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
          accessibilityLabel="Add location photos"
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
            Add photos
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
