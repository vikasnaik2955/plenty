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
import { useApp } from '@/store/app-store';
import { colors, radius, space } from '@/theme';

const TYPE_OPTIONS = [
  { value: 'Community shelter', label: 'Community shelter' },
  { value: 'NGO', label: 'NGO' },
  { value: 'Community kitchen', label: 'Community kitchen' },
  { value: "Children's home", label: "Children's home" },
  { value: 'Old age home', label: 'Old age home' },
  { value: 'Orphanage', label: 'Orphanage' },
  { value: 'Other', label: 'Other' },
];

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
  const s = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState('Community shelter');
  const [people, setPeople] = useState('');
  const [distance, setDistance] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const peopleNum = parseInt(people, 10);
  const valid = name.trim().length > 0 && peopleNum > 0 && address.trim().length > 0;

  const save = () => {
    if (!valid) return;
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
      header={<AppBar title="Add a shelter or community" onBack={() => router.back()} />}
      footer={
        <View style={{ gap: space[2] }}>
          {!valid && (
            <Text variant="caption" color={colors.textMuted} align="center">
              Add a name, number of people, and location to save.
            </Text>
          )}
          <Button fullWidth size="lg" disabled={!valid} onPress={save} leftIcon="building-2">
            Save shelter
          </Button>
        </View>
      }
    >
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Icon name="building-2" size={22} color={colors.clothes} />
        </View>
        <Text variant="body" color={colors.textSecondary} style={{ flex: 1, lineHeight: 15 * 1.45 }}>
          Add a place that needs donations. Donors can then pick it as a recipient.
        </Text>
      </View>

      <View style={{ gap: space[4] }}>
        <Input
          label="Place / organization"
          required
          value={name}
          onChangeText={setName}
          placeholder="e.g. Hope Shelter"
          leftIcon={ICON_BUILDING}
        />
        <Select
          label="Type"
          required
          value={type}
          onValueChange={setType}
          options={TYPE_OPTIONS}
        />
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          <Input
            label="Number of people"
            required
            value={people}
            onChangeText={setPeople}
            placeholder="e.g. 40"
            keyboardType="number-pad"
            leftIcon={ICON_USERS}
            containerStyle={FLEX_1}
          />
          <Input
            label="Distance (km)"
            value={distance}
            onChangeText={setDistance}
            placeholder="e.g. 2.4"
            keyboardType="decimal-pad"
            leftIcon={ICON_NAV}
            containerStyle={FLEX_1}
          />
        </View>
        <Input
          label="Address / location"
          required
          value={address}
          onChangeText={setAddress}
          placeholder="Street, area, landmark"
          leftIcon={ICON_PIN}
        />
        <Input
          label="Contact"
          value={contact}
          onChangeText={setContact}
          placeholder="+91"
          keyboardType="phone-pad"
          leftIcon={ICON_PHONE}
        />

        <View>
          <Text variant="sm" weight={600} color={colors.textSecondary} style={{ marginBottom: space[2] }}>
            Location photos
          </Text>
          <ShelterImagesPicker value={images} onChange={setImages} accent={colors.clothes} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: space[2] }}>
            Add a few photos of the place so donors and volunteers can recognise it.
          </Text>
        </View>

        <Textarea
          label="Notes for donors"
          value={notes}
          onChangeText={setNotes}
          maxLength={140}
          placeholder="Access hours, directions, what's needed most…"
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
