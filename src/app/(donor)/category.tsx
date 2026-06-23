/**
 * DonorCategory — Food / Clothes picker; the visual fork between donation flows.
 * Ported from DonorScreens.jsx `DonorCategory`. A sub-flow (AppBar, no nav).
 */
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { CategoryCard } from '@/components/ui/category-card';
import { Page } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import { colors } from '@/theme';

export default function DonorCategory() {
  const router = useRouter();
  const s = useApp();

  const pick = (category: 'food' | 'clothes') => {
    s.setDraft({ category, needsVolunteer: null });
    router.push('/(donor)/form');
  };

  return (
    <Page header={<AppBar title="What are you donating?" onBack={() => router.back()} />}>
      <Text variant="body" color={colors.textSecondary} style={{ marginTop: 4, marginBottom: 18 }}>
        Pick a category to get started.
      </Text>
      <View style={{ gap: 14 }}>
        <CategoryCard
          category="food"
          selected={s.draft.category === 'food'}
          onPress={() => pick('food')}
        />
        <CategoryCard
          category="clothes"
          selected={s.draft.category === 'clothes'}
          onPress={() => pick('clothes')}
        />
      </View>
    </Page>
  );
}
