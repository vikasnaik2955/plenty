/**
 * DonorNearby — map/list of nearby recipients with a confirm sheet.
 * Ported from DonorScreens2.jsx `DonorNearby` plus the confirm BottomSheet from
 * app.jsx (`confirmSend`). Picking a recipient and confirming sends the request.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ShelterDetailsSheet } from '@/components/shelter-details-sheet';
import { AppBar } from '@/components/ui/app-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { ConsumerCard } from '@/components/ui/consumer-card';
import { DetailRow } from '@/components/ui/detail-row';
import { Icon } from '@/components/ui/icon';
import { MapPlaceholder, type MapPin } from '@/components/ui/map-placeholder';
import { Page } from '@/components/ui/page';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useApp } from '@/store/app-store';
import { colors, radius } from '@/theme';
import type { Consumer } from '@/data/types';

const PIN_X = [30, 68, 44, 74];
const PIN_Y = [34, 40, 64, 70];

export default function DonorNearby() {
  const router = useRouter();
  const s = useApp();
  const [view, setView] = useState('map');
  const [picked, setPicked] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detail, setDetail] = useState<Consumer | null>(null);

  const list = s.data.CONSUMERS;
  const selfHandover = s.draft.needsVolunteer === false;
  const accent = s.draft.category === 'food' ? colors.food : colors.clothes;

  // Donations each recipient has received this month — surface the under-served
  // ones first so donors can spread support more evenly.
  const countFor = (name: string) => {
    const c = s.donationCounts[name];
    return c ? c.food + c.clothes : 0;
  };
  const avg = list.length
    ? list.reduce((sum, c) => sum + countFor(c.name), 0) / list.length
    : 0;
  const sorted = [...list].sort(
    (a, b) => countFor(a.name) - countFor(b.name) || Number(a.distance) - Number(b.distance),
  );

  const pins: MapPin[] = list.map((c, i) => ({
    x: PIN_X[i] ?? 50,
    y: PIN_Y[i] ?? 50,
    label: c.name.split(' ')[0],
    accent,
  }));

  const chosen = list.find((c) => c.id === picked);

  const confirm = () => {
    if (!chosen) return;
    setSheetOpen(false);
    s.confirmSend(chosen);
    router.replace('/(donor)/track');
  };

  return (
    <Page
      header={
        <AppBar
          title="Recipients within 10 km"
          subtitle={`${list.length} nearby · least-served first`}
          onBack={() => router.back()}
        />
      }
      footer={
        <Button fullWidth size="lg" disabled={!picked} onPress={() => setSheetOpen(true)}>
          {picked ? 'Send request' : 'Select a recipient'}
        </Button>
      }
    >
      <Tabs
        active={view}
        onChange={setView}
        items={[
          { key: 'map', label: 'Map' },
          { key: 'list', label: 'List' },
        ]}
        style={{ marginBottom: 14 }}
      />
      {view === 'map' && (
        <View style={{ marginBottom: 14 }}>
          <MapPlaceholder height={200} radiusLabel="10 km" pins={pins} />
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.brandSoft,
          borderRadius: radius.md,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Icon name="info" size={16} color={colors.brandStrong} />
        <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, lineHeight: 17 }}>
          Places with fewer donations this month are shown first — picking them helps spread support.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {sorted.map((c) => (
          <ConsumerCard
            key={c.id}
            name={c.name}
            type={c.type}
            distance={c.distance}
            people={c.people}
            photoCount={c.images?.length ?? 0}
            monthCount={countFor(c.name)}
            needsMore={countFor(c.name) < avg}
            selected={picked === c.id}
            onSelect={() => setPicked(c.id)}
            onPress={() => setDetail(c)}
          />
        ))}

        <Pressable
          onPress={() => router.push('/(donor)/add-shelter')}
          accessibilityRole="button"
          accessibilityLabel="Add a shelter or community"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderStrong,
            backgroundColor: colors.surfaceCard,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.clothesSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={22} color={colors.clothes} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight={700} color={colors.textPrimary}>
              Add a shelter or community
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              Not listed? Register a new recipient with photos
            </Text>
          </View>
        </Pressable>
      </View>

      <BottomSheet
        open={sheetOpen}
        title="Send this request?"
        onClose={() => setSheetOpen(false)}
        footer={
          <Button fullWidth size="lg" onPress={confirm}>
            {selfHandover ? 'Confirm donation' : 'Confirm & notify volunteers'}
          </Button>
        }
      >
        {chosen && (
          <View>
            <Text
              variant="body"
              color={colors.textSecondary}
              style={{ marginBottom: 14, lineHeight: 15 * 1.5 }}
            >
              {selfHandover ? (
                <>
                  We&apos;ll let{' '}
                  <Text variant="body" weight={700} color={colors.textPrimary}>
                    {chosen.name}
                  </Text>{' '}
                  know your {s.draft.category} donation is ready. You&apos;ll arrange the handover
                  directly — no volunteer involved.
                </>
              ) : (
                <>
                  We&apos;ll broadcast your {s.draft.category} donation to volunteers within 10 km.
                  The first to accept will handle pickup and delivery to{' '}
                  <Text variant="body" weight={700} color={colors.textPrimary}>
                    {chosen.name}
                  </Text>
                  .
                </>
              )}
            </Text>
            <DetailRow
              icon={selfHandover ? 'hand' : 'bike'}
              label="Delivery"
              value={selfHandover ? 'Self handover' : 'Volunteer pickup & delivery'}
            />
            <DetailRow
              icon="users"
              label="Recipient need"
              value={`${chosen.people} people · ${chosen.type}`}
            />
            <DetailRow icon="navigation" label="Distance" value={`${chosen.distance} km away`} />
          </View>
        )}
      </BottomSheet>

      <ShelterDetailsSheet
        consumer={detail}
        onClose={() => setDetail(null)}
        footer={
          detail && (
            <Button
              fullWidth
              size="lg"
              onPress={() => {
                setPicked(detail.id);
                setDetail(null);
              }}
            >
              Select recipient
            </Button>
          )
        }
      />
    </Page>
  );
}
