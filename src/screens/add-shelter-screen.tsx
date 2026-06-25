/**
 * AddShelterScreen — lets a donor or volunteer register a new shelter /
 * community with its location, location photos, and number of people. Saved
 * through the store so it appears as a selectable recipient everywhere.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ShelterImagesPicker } from '@/components/shelter-images-picker';
import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page } from '@/components/ui/page';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius, space } from '@/theme';
import { requireFields } from '@/utils/validation';

// `value` is the stored shelter type (kept English so saved data is stable
// across languages); only the visible `label` is translated per-render.
const TYPE_KEYS = [
  { value: 'Community shelter', key: 'addShelter.typeCommunityShelter' },
  { value: 'NGO', key: 'addShelter.typeNGO' },
  { value: 'Community kitchen', key: 'addShelter.typeCommunityKitchen' },
  { value: "Children's home", key: 'addShelter.typeChildrensHome' },
  { value: 'Old age home', key: 'addShelter.typeOldAgeHome' },
  { value: 'Orphanage', key: 'addShelter.typeOrphanage' },
  { value: 'Other', key: 'addShelter.typeOther' },
] as const;

// Stable, render-invariant leading icons + style. Creating these fresh on every
// render churned each Input's child-element identity and (under Fabric) remounted
// the native TextInput — which made focus bounce between fields in a loop.
const ICON_BUILDING = <Icon name="building-2" size={18} color={colors.textMuted} />;
const ICON_USERS = <Icon name="users" size={18} color={colors.textMuted} />;
const ICON_NAV = <Icon name="navigation" size={18} color={colors.textMuted} />;
const ICON_PIN = <Icon name="map-pin" size={18} color={colors.textMuted} />;
const ICON_PHONE = <Icon name="phone" size={18} color={colors.textMuted} />;
const FLEX_1 = { flex: 1 } as const;

export function AddShelterScreen() {
  const router = useRouter();
  const t = useT();
  const s = useApp();

  const typeOptions = TYPE_KEYS.map((o) => ({ value: o.value, label: t(o.key) }));

  const [name, setName] = useState('');
  const [type, setType] = useState('Community shelter');
  const [people, setPeople] = useState('');
  const [distance, setDistance] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const peopleNum = parseInt(people, 10);

  const save = () => {
    const ok = requireFields(
      [
        { value: name, label: t('addShelter.placeLabel') },
        { value: type, label: t('addShelter.typeLabel') },
        { value: peopleNum, label: t('addShelter.peopleLabel') },
        { value: address, label: t('addShelter.addressLabel') },
      ],
      t,
    );
    if (!ok) return;
    const distNum = parseFloat(distance);
    s.addConsumer({
      name,
      type,
      people: peopleNum,
      distance: Number.isFinite(distNum) && distNum > 0 ? Math.round(distNum * 10) / 10 : 2,
      address,
      contact,
      images,
      notes,
    });
    router.back();
  };

  return (
    <Page
      header={<AppBar title={t('addShelter.title')} onBack={() => router.back()} />}
      footer={
        <Button fullWidth size="lg" onPress={save} leftIcon="building-2">
          {t('addShelter.save')}
        </Button>
      }
    >
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Icon name="building-2" size={22} color={colors.clothes} />
        </View>
        <Text variant="body" color={colors.textSecondary} style={{ flex: 1, lineHeight: 15 * 1.45 }}>
          {t('addShelter.intro')}
        </Text>
      </View>

      <View style={{ gap: space[4] }}>
        <Input
          label={t('addShelter.placeLabel')}
          required
          value={name}
          onChangeText={setName}
          placeholder={t('addShelter.placePlaceholder')}
          leftIcon={ICON_BUILDING}
        />
        <Select
          label={t('addShelter.typeLabel')}
          required
          value={type}
          onValueChange={setType}
          options={typeOptions}
        />
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          <Input
            label={t('addShelter.peopleLabel')}
            required
            value={people}
            onChangeText={setPeople}
            placeholder={t('addShelter.peoplePlaceholder')}
            keyboardType="number-pad"
            leftIcon={ICON_USERS}
            containerStyle={FLEX_1}
          />
          <Input
            label={t('addShelter.distanceLabel')}
            value={distance}
            onChangeText={setDistance}
            placeholder={t('addShelter.distancePlaceholder')}
            keyboardType="decimal-pad"
            leftIcon={ICON_NAV}
            containerStyle={FLEX_1}
          />
        </View>
        <Input
          label={t('addShelter.addressLabel')}
          required
          value={address}
          onChangeText={setAddress}
          placeholder={t('addShelter.addressPlaceholder')}
          leftIcon={ICON_PIN}
        />
        <Input
          label={t('addShelter.contactLabel')}
          value={contact}
          onChangeText={setContact}
          placeholder="+91"
          keyboardType="phone-pad"
          leftIcon={ICON_PHONE}
        />

        <View>
          <Text variant="sm" weight={600} color={colors.textSecondary} style={{ marginBottom: space[2] }}>
            {t('addShelter.locationPhotos')}
          </Text>
          <ShelterImagesPicker value={images} onChange={setImages} accent={colors.clothes} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: space[2] }}>
            {t('addShelter.photosHint')}
          </Text>
        </View>

        <Textarea
          label={t('addShelter.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          maxLength={140}
          placeholder={t('addShelter.notesPlaceholder')}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.clothesSoft,
    borderRadius: radius.md,
    padding: space[3] + 2,
    marginBottom: space[5],
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
