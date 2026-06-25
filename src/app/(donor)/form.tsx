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
import { useT, type TFunction } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius } from '@/theme';
import { formatDateTime } from '@/utils/datetime';
import { requireFields } from '@/utils/validation';

const OPTIONS = [
  { val: true, icon: 'bike', titleKey: 'donorForm.volYesTitle', descKey: 'donorForm.volYesDesc' },
  { val: false, icon: 'hand', titleKey: 'donorForm.volNoTitle', descKey: 'donorForm.volNoDesc' },
];

const FOOD_TYPES = [
  { value: 'cooked', labelKey: 'donorForm.foodCooked' },
  { value: 'packaged', labelKey: 'donorForm.foodPackaged' },
  { value: 'raw', labelKey: 'donorForm.foodRaw' },
  { value: 'bakery', labelKey: 'donorForm.foodBakery' },
  { value: 'fruits', labelKey: 'donorForm.foodFruits' },
  { value: 'other', labelKey: 'donorForm.typeOther' },
];
const CLOTH_TYPES = [
  { value: 'men', labelKey: 'donorForm.clothMen' },
  { value: 'women', labelKey: 'donorForm.clothWomen' },
  { value: 'kids', labelKey: 'donorForm.clothKids' },
  { value: 'winter', labelKey: 'donorForm.clothWinter' },
  { value: 'general', labelKey: 'donorForm.clothGeneral' },
  { value: 'other', labelKey: 'donorForm.typeOther' },
];
const CONDITIONS = [
  { value: 'new', labelKey: 'donorForm.condNew' },
  { value: 'gently', labelKey: 'donorForm.condGently' },
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

const labelOf = (opts: { value: string; labelKey: string }[], v: string, t: TFunction) => {
  const key = opts.find((o) => o.value === v)?.labelKey;
  return key ? t(key) : '';
};

export default function DonorForm() {
  const router = useRouter();
  const s = useApp();
  const t = useT();

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

  const onContinue = () => {
    // Block submit until every required (*) field is filled, naming the gaps.
    const required = [
      { value: needsVolunteer == null ? '' : 'ok', label: t('donorForm.volunteerQuestion') },
      ...(isFood
        ? [
            { value: serves, label: t('donorForm.servesLabel') },
            { value: foodType, label: t('donorForm.foodTypeLabel') },
            ...(foodType === 'other' ? [{ value: foodOther, label: t('donorForm.otherFoodTypeLabel') }] : []),
          ]
        : [
            { value: clothType, label: t('donorForm.clothTypeLabel') },
            ...(clothType === 'other' ? [{ value: clothOther, label: t('donorForm.otherClothTypeLabel') }] : []),
            { value: condition, label: t('donorForm.conditionLabel') },
          ]),
      { value: photo ?? '', label: t('donorForm.photoEvidence') },
    ];
    if (!requireFields(required, t)) return;
    if (isFood) {
      const title = foodType === 'other' ? foodOther.trim() || t('donorForm.foodFallback') : labelOf(FOOD_TYPES, foodType, t);
      s.setDraft({
        title,
        serves: parseInt(serves, 10) || undefined,
        note: [foodDesc.trim(), t('donorForm.bestBeforeNote', { datetime: formatDateTime(bestBefore.getTime()) })]
          .filter(Boolean)
          .join(' · '),
      });
    } else {
      const title =
        clothType === 'other'
          ? clothOther.trim() || t('donorForm.clothesFallback')
          : t('donorForm.clothesTitle', { type: labelOf(CLOTH_TYPES, clothType, t) });
      s.setDraft({
        title,
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
          title={isFood ? t('donorForm.foodTitle') : t('donorForm.clothesDetailsTitle')}
          onBack={() => router.back()}
          action={
            <StatusBadge tone={isFood ? 'food' : 'clothes'} dot={false}>
              {isFood ? t('donorForm.foodBadge') : t('donorForm.clothesBadge')}
            </StatusBadge>
          }
        />
      }
      footer={
        <Button fullWidth size="lg" onPress={onContinue} style={{ backgroundColor: accent }}>
          {t('donorForm.findRecipients')}
        </Button>
      }
    >
      <View style={{ gap: 16 }}>
        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 8 }}>
            {t('donorForm.volunteerQuestion')}{' '}
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
                      {t(opt.titleKey)}
                    </Text>
                    <Text size={12} color={colors.textMuted}>
                      {t(opt.descKey)}
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
              label={t('donorForm.servesLabel')}
              keyboardType="number-pad"
              placeholder={t('donorForm.servesPlaceholder')}
              required
              value={serves}
              onChangeText={setServes}
              leftIcon={ICON_USERS}
            />
            <Select
              label={t('donorForm.foodTypeLabel')}
              required
              placeholder={t('donorForm.choosePlaceholder')}
              value={foodType}
              onValueChange={setFoodType}
              options={FOOD_TYPES.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            {foodType === 'other' && (
              <Input
                label={t('donorForm.otherFoodTypeLabel')}
                placeholder={t('donorForm.otherFoodTypePlaceholder')}
                value={foodOther}
                onChangeText={setFoodOther}
                leftIcon={ICON_TAG}
              />
            )}
            <DateTimeField
              label={t('donorForm.bestBeforeLabel')}
              hint={t('donorForm.bestBeforeHint')}
              value={bestBefore}
              onChange={setBestBefore}
              minimumDate={new Date()}
              accent={accent}
            />
            <Textarea
              label={t('donorForm.descriptionLabel')}
              maxLength={120}
              value={foodDesc}
              onChangeText={setFoodDesc}
              placeholder={t('donorForm.foodDescPlaceholder')}
            />
          </>
        ) : (
          <>
            <Select
              label={t('donorForm.clothTypeLabel')}
              required
              placeholder={t('donorForm.choosePlaceholder')}
              value={clothType}
              onValueChange={setClothType}
              options={CLOTH_TYPES.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            {clothType === 'other' && (
              <Input
                label={t('donorForm.otherClothTypeLabel')}
                placeholder={t('donorForm.otherClothTypePlaceholder')}
                value={clothOther}
                onChangeText={setClothOther}
                leftIcon={ICON_TAG}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Input label={t('donorForm.sizeRangeLabel')} placeholder={t('donorForm.sizeRangePlaceholder')} value={sizeRange} onChangeText={setSizeRange} containerStyle={FLEX_1} />
              <Input
                label={t('donorForm.quantityLabel')}
                placeholder={t('donorForm.quantityPlaceholder')}
                value={quantity}
                onChangeText={setQuantity}
                containerStyle={FLEX_1}
                leftIcon={ICON_PACKAGE}
              />
            </View>
            <Select
              label={t('donorForm.conditionLabel')}
              required
              placeholder={t('donorForm.choosePlaceholder')}
              value={condition}
              onValueChange={setCondition}
              options={CONDITIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <Textarea
              label={t('donorForm.descriptionLabel')}
              maxLength={120}
              value={clothDesc}
              onChangeText={setClothDesc}
              placeholder={t('donorForm.clothDescPlaceholder')}
            />
          </>
        )}

        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 6 }}>
            {t('donorForm.pickupLocation')}
          </Text>
          <View style={styles.pickup}>
            <Icon name="map-pin" size={18} color={accent} />
            <Text size={15} weight={600} color={colors.textPrimary} style={{ flex: 1 }}>
              12 Carter Rd, Bandra West
            </Text>
            <Text size={12} weight={700} color={colors.brandStrong}>
              {t('donorForm.autoDetected')}
            </Text>
          </View>
        </View>

        <View>
          <Text size={14} weight={600} color={colors.textSecondary} style={{ marginBottom: 6 }}>
            {t('donorForm.photoEvidence')}{' '}
            <Text size={14} weight={600} color={colors.error}>
              *
            </Text>
          </Text>
          <PhotoPicker value={photo} onPick={setPhoto} label={t('donorForm.addPhotoEvidence')} accent={accent} />
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
