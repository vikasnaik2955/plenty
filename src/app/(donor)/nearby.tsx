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
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, radius } from '@/theme';
import type { Consumer } from '@/data/types';

const PIN_X = [30, 68, 44, 74];
const PIN_Y = [34, 40, 64, 70];

export default function DonorNearby() {
  const router = useRouter();
  const s = useApp();
  const t = useT();
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
          title={t('donorNearby.title')}
          subtitle={t('donorNearby.subtitle', { count: list.length })}
          onBack={() => router.back()}
        />
      }
      footer={
        <Button fullWidth size="lg" disabled={!picked} onPress={() => setSheetOpen(true)}>
          {picked ? t('donorNearby.sendRequest') : t('donorNearby.selectRecipient')}
        </Button>
      }
    >
      <Tabs
        active={view}
        onChange={setView}
        items={[
          { key: 'map', label: t('donorNearby.tabMap') },
          { key: 'list', label: t('donorNearby.tabList') },
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
          {t('donorNearby.leastServedHint')}
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
          accessibilityLabel={t('donorNearby.addShelter')}
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
              {t('donorNearby.addShelter')}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {t('donorNearby.addShelterHint')}
            </Text>
          </View>
        </Pressable>
      </View>

      <BottomSheet
        open={sheetOpen}
        title={t('donorNearby.confirmTitle')}
        onClose={() => setSheetOpen(false)}
        footer={
          <Button fullWidth size="lg" onPress={confirm}>
            {selfHandover ? t('donorNearby.confirmDonation') : t('donorNearby.confirmNotify')}
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
                  {t('donorNearby.selfHandoverBody1')}{' '}
                  <Text variant="body" weight={700} color={colors.textPrimary}>
                    {chosen.name}
                  </Text>{' '}
                  {t('donorNearby.selfHandoverBody2', { category: s.draft.category })}
                </>
              ) : (
                <>
                  {t('donorNearby.broadcastBody1', { category: s.draft.category })}{' '}
                  <Text variant="body" weight={700} color={colors.textPrimary}>
                    {chosen.name}
                  </Text>
                  {t('donorNearby.broadcastBody2')}
                </>
              )}
            </Text>
            <DetailRow
              icon={selfHandover ? 'hand' : 'bike'}
              label={t('donorNearby.deliveryLabel')}
              value={selfHandover ? t('donorNearby.selfHandover') : t('donorNearby.volunteerPickup')}
            />
            <DetailRow
              icon="users"
              label={t('donorNearby.recipientNeed')}
              value={t('donorNearby.peopleType', { count: chosen.people, type: chosen.type })}
            />
            <DetailRow icon="navigation" label={t('donorNearby.distance')} value={t('donorNearby.kmAway', { distance: chosen.distance })} />
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
              {t('donorNearby.selectRecipientBtn')}
            </Button>
          )
        }
      />
    </Page>
  );
}
