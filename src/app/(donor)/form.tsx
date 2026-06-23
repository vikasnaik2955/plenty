/**
 * DonorForm — conditional food/clothes request form.
 * Ported from DonorScreens.jsx `DonorForm`. The Selects are controlled (so a
 * choice actually registers), food/clothes type include an "Other" option with
 * a custom field, and the captured details are written to the donation draft.
 * PhotoPicker replaces the original fake upload toggle.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { DateTimeField } from '@/components/ui/datetime-field';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { PhotoPicker } from '@/components/ui/photo-picker';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/store/app-store';
import { colors, radius } from '@/theme';
import { formatDateTime } from '@/utils/datetime';

const OPTIONS = [
  { val: true, icon: 'bike', title: 'Yes, send a volunteer', desc: 'A nearby volunteer collects and delivers it' },
  { val: false, icon: 'hand', title: "No, I'll hand it over myself", desc: 'You drop it off or the recipient collects' },
];

const FOOD_TYPES = [
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'packaged', label: 'Packaged food' },
  { value: 'raw', label: 'Raw ingredients' },
  { value: 'bakery', label: 'Bakery & snacks' },
  { value: 'fruits', label: 'Fruits & vegetables' },
  { value: 'other', label: 'Other' },
];
const CLOTH_TYPES = [
  { value: 'men', label: "Men's" },
  { value: 'women', label: "Women's" },
  { value: 'kids', label: 'Kids' },
  { value: 'winter', label: 'Winter wear' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' },
];
const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'gently', label: 'Gently used' },
];

// Stable leading-icon elements (avoids per-render element churn under Fabric).
const ICON_USERS = <Icon name="users" size={18} color={colors.textMuted} />;
const ICON_PACKAGE = <Icon name="package" size={18} color={colors.textMuted} />;

/** Default "best before" — today at 8 PM. */
function defaultBestBefore(): Date {
  const d = new Date();
  d.setHours(20, 0, 0, 0);
  return d;
}
const ICON_TAG = <Icon name="tag" size={18} color={colors.textMuted} />;
const FLEX_1 = { flex: 1 } as const;

const labelOf = (opts: { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? '';

export default function DonorForm() {
  const router = useRouter();
  const s = useApp();

  const isFood = s.draft.category === 'food';
  const accent = isFood ? colors.food : colors.clothes;
  const needsVolunteer = s.draft.needsVolunteer;

  // Food
  const [serves, setServes] = useState('');
  const [foodType, setFoodType] = useState('');
  const [foodOther, setFoodOther] = useState('');
  const [bestBefore, setBestBefore] = useState(defaultBestBefore);
  const [foodDesc, setFoodDesc] = useState('');
  // Clothes
  const [clothType, setClothType] = useState('');
  const [clothOther, setClothOther] = useState('');
  const [sizeRange, setSizeRange] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');
  const [clothDesc, setClothDesc] = useState('');

  const [photo, setPhoto] = useState<string | undefined>(undefined);

  const typeChosen = isFood ? !!foodType : !!clothType;
  const ready = needsVolunteer != null && typeChosen;

  const onContinue = () => {
    if (!ready) return;
    if (isFood) {
      const t = foodType === 'other' ? foodOther.trim() || 'Food' : labelOf(FOOD_TYPES, foodType);
      s.setDraft({
        title: t,
        serves: parseInt(serves, 10) || undefined,
        note: [foodDesc.trim(), `Best before ${formatDateTime(bestBefore.getTime())}`]
          .filter(Boolean)
          .join(' · '),
      });
    } else {
      const t = clothType === 'other' ? clothOther.trim() || 'Clothes' : `${labelOf(CLOTH_TYPES, clothType)} clothes`;
      s.setDraft({
        title: t,
        pieces: quantity.trim() || undefined,
        note: clothDesc.trim() || undefined,
      });
    }
    router.push('/(donor)/nearby');
  };

  return (
    <Page
      header={
        <AppBar
          title={isFood ? 'Food details' : 'Clothes details'}
          onBack={() => router.back()}
          action={
            <StatusBadge tone={isFood ? 'food' : 'clothes'} dot={false}>
              {isFood ? 'Food' : 'Clothes'}
            </StatusBadge>
          }
        />
      }
      footer={
        <Button
          fullWidth
          size="lg"
          disabled={!ready}
          onPress={onContinue}
          style={ready ? { backgroundColor: accent } : undefined}
        >
          {needsVolunteer == null
            ? 'Choose a delivery option'
            : !typeChosen
              ? `Choose a ${isFood ? 'food' : 'clothing'} type`
              : 'Find nearby recipients'}
        </Button>
      }
    >
      <View style={{ gap: 16 }}>
        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
            Do you need a volunteer to pick up & deliver?{' '}
            <Text size={14} weight={600} color={colors.error}>
              *
            </Text>
          </Text>
          <View style={{ gap: 10 }}>
            {OPTIONS.map((opt) => {
              const on = needsVolunteer === opt.val;
              return (
                <Pressable
                  key={String(opt.val)}
                  onPress={() => s.setDraft({ needsVolunteer: opt.val })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[
                    styles.option,
                    { backgroundColor: on ? colors.brandSoft : colors.surfaceCard, borderColor: on ? colors.brand : colors.borderSubtle },
                  ]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: on ? colors.brand : colors.surfaceSunken }]}>
                    <Icon name={opt.icon} size={20} color={on ? '#fff' : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text size={15} weight={700} color={colors.textPrimary}>
                      {opt.title}
                    </Text>
                    <Text size={12} color={colors.textMuted}>
                      {opt.desc}
                    </Text>
                  </View>
                  <View style={[styles.radio, { borderColor: on ? colors.brand : colors.borderStrong, backgroundColor: on ? colors.brand : 'transparent' }]}>
                    {on && <Icon name="check" size={13} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isFood ? (
          <>
            <Input
              label="How many people does it serve?"
              keyboardType="number-pad"
              placeholder="e.g. 12"
              required
              value={serves}
              onChangeText={setServes}
              leftIcon={ICON_USERS}
            />
            <Select
              label="Food type"
              required
              placeholder="Choose…"
              value={foodType}
              onValueChange={setFoodType}
              options={FOOD_TYPES}
            />
            {foodType === 'other' && (
              <Input
                label="Other food type"
                placeholder="Tell us what kind of food"
                value={foodOther}
                onChangeText={setFoodOther}
                leftIcon={ICON_TAG}
              />
            )}
            <DateTimeField
              label="Best before"
              hint="Food freshness window — when it should be delivered by"
              value={bestBefore}
              onChange={setBestBefore}
              minimumDate={new Date()}
              accent={accent}
            />
            <Textarea
              label="Description"
              maxLength={120}
              value={foodDesc}
              onChangeText={setFoodDesc}
              placeholder="Veg biryani, freshly cooked, mildly spiced"
            />
          </>
        ) : (
          <>
            <Select
              label="Clothing type"
              required
              placeholder="Choose…"
              value={clothType}
              onValueChange={setClothType}
              options={CLOTH_TYPES}
            />
            {clothType === 'other' && (
              <Input
                label="Other clothing type"
                placeholder="Tell us what kind of clothes"
                value={clothOther}
                onChangeText={setClothOther}
                leftIcon={ICON_TAG}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Input label="Size range" placeholder="S–XL" value={sizeRange} onChangeText={setSizeRange} containerStyle={FLEX_1} />
              <Input
                label="Quantity"
                placeholder="3 bags"
                value={quantity}
                onChangeText={setQuantity}
                containerStyle={FLEX_1}
                leftIcon={ICON_PACKAGE}
              />
            </View>
            <Select
              label="Condition"
              required
              placeholder="Choose…"
              value={condition}
              onValueChange={setCondition}
              options={CONDITIONS}
            />
            <Textarea
              label="Description"
              maxLength={120}
              value={clothDesc}
              onChangeText={setClothDesc}
              placeholder="Warm jackets, mixed sizes, freshly washed"
            />
          </>
        )}

        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 6 }}>
            Pickup location
          </Text>
          <View style={styles.pickup}>
            <Icon name="map-pin" size={18} color={accent} />
            <Text size={15} weight={600} color={colors.textPrimary} style={{ flex: 1 }}>
              12 Carter Rd, Bandra West
            </Text>
            <Text size={12} weight={700} color={colors.brandStrong}>
              Auto-detected
            </Text>
          </View>
        </View>

        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 6 }}>
            Photo evidence{' '}
            <Text size={14} weight={600} color={colors.error}>
              *
            </Text>
          </Text>
          <PhotoPicker value={photo} onPick={setPhoto} label="Add photo evidence" accent={accent} />
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: 14,
  },
  optionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pickup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
  },
});
