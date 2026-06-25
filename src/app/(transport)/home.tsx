/**
 * Transport Home — a provider's job board. Shows online status + verification,
 * then delivery jobs the driver can offer a ride for (picking which of their
 * vehicles to send). Offering requires a verified account.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MessagesButton } from '@/components/messages-button';
import { NotificationsButton } from '@/components/notifications-button';
import { RoleBottomNav } from '@/components/role-bottom-nav';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Hero } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { Page } from '@/components/ui/page';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useT } from '@/i18n/use-t';
import { useApp } from '@/store/app-store';
import { colors, palette, radius, shadows, space } from '@/theme';
import { shareImpact } from '@/utils/share';
import type { OpenRequest } from '@/data/types';

const vIcon = (t: string) => (t === 'Cargo van' ? 'truck' : t === 'Two-wheeler' ? 'bike' : t === 'Car' ? 'car' : 'caravan');

export default function TransportHome() {
  const router = useRouter();
  const s = useApp();
  const t = useT();
  const profile = s.profiles.transport;

  const online = s.transportOnline;
  const verified = s.transportVerification.status === 'verified';
  const availableVehicles = s.transportVehicles.filter((v) => v.available);

  const me = profile.name;
  const jobs = s.data.OPEN_REQUESTS;
  const myOffers = s.transportOffers.filter((o) => o.provider === me);
  const offeredCount = myOffers.length;
  const acceptedCount = myOffers.filter((o) => o.accepted).length;

  // jobId we're choosing a vehicle for.
  const [pickFor, setPickFor] = useState<string | null>(null);

  const openTrack = (r: OpenRequest) =>
    router.push({
      pathname: '/track-map',
      params: { title: r.title, pickup: r.donor, dropoff: r.drop, transport: availableVehicles[0]?.type ?? 'Transport' },
    });

  const offer = (jobId: string) => {
    if (!verified) {
      router.push('/(transport)/verify');
      return;
    }
    if (availableVehicles.length === 0) {
      s.showToast(t('transportHome.addVehicleFirst'), 'error');
      router.push('/(transport)/vehicle');
      return;
    }
    if (availableVehicles.length === 1) {
      s.offerTransport(jobId, availableVehicles[0].id);
      return;
    }
    setPickFor(jobId);
  };

  return (
    <Page
      nav={<RoleBottomNav role="transport" active="home" />}
      pad={false}
      header={
        <Hero
          accent={palette.violet500}
          accent2="#4B3CA8"
          eyebrow={t('transportHome.eyebrow')}
          title={profile.name}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <NotificationsButton />
              <MessagesButton />
              <Avatar name={profile.name} src={profile.photo ?? undefined} accent="brand" ring />
            </View>
          }
        >
          <View style={styles.availRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text size={15} weight={800} color="#fff">
                  {online ? t('transportHome.online') : t('transportHome.offline')}
                </Text>
                {verified && (
                  <View style={styles.verifiedPill}>
                    <Icon name="shield-check" size={12} color="#fff" />
                    <Text size={11} weight={800} color="#fff">
                      {t('transportHome.verified')}
                    </Text>
                  </View>
                )}
              </View>
              <Text size={12} color="#fff" style={{ opacity: 0.85 }}>
                {s.transportVehicles.length === 1
                  ? t('transportHome.vehicleCountAvailableOne', { available: availableVehicles.length })
                  : t('transportHome.vehicleCountAvailableOther', {
                      count: s.transportVehicles.length,
                      available: availableVehicles.length,
                    })}
              </Text>
            </View>
            <Switch checked={online} onChange={s.setTransportOnline} />
          </View>
        </Hero>
      }
    >
      <View style={styles.body}>
        {!verified && (
          <Pressable onPress={() => router.push('/(transport)/verify')} style={styles.verifyBanner} accessibilityRole="button">
            <View style={styles.verifyIcon}>
              <Icon name="shield-alert" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={700}>
                {s.transportVerification.status === 'pending'
                  ? t('transportHome.verifyBannerPending')
                  : t('transportHome.verifyBannerTitle')}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {t('transportHome.verifyBannerSubtitle')}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        )}

        {acceptedCount > 0 && (
          <Button
            fullWidth
            variant="secondary"
            leftIcon="share-2"
            onPress={() => shareImpact(t, 'transport')}
            style={{ marginBottom: space[3] }}
          >
            {t('share.button')}
          </Button>
        )}

        <SectionHeader
          title={online ? t('transportHome.availableJobsCount', { count: jobs.length }) : t('transportHome.availableJobs')}
        />
        {!online ? (
          <EmptyState
            compact
            icon="moon"
            title={t('transportHome.offlineTitle')}
            message={t('transportHome.offlineMessage')}
            accent="neutral"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            compact
            icon="check-check"
            title={t('transportHome.allClearTitle')}
            message={t('transportHome.allClearMessage')}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {jobs.map((r) => {
              const myOffer = myOffers.find((o) => o.jobId === r.id);
              const offered = !!myOffer;
              const accepted = !!myOffer?.accepted;
              const isFood = r.category === 'food';
              const accent = isFood ? colors.food : colors.clothes;
              const soft = isFood ? colors.foodSoft : colors.clothesSoft;
              return (
                <View key={r.id} style={styles.job}>
                  <Pressable onPress={() => openTrack(r)} accessibilityRole="button" style={styles.jobMain}>
                    <View style={[styles.jobIcon, { backgroundColor: soft }]}>
                      <Icon name={isFood ? 'utensils' : 'shirt'} size={22} color={accent} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text size={15} weight={700} color={colors.textPrimary} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <View style={styles.jobMeta}>
                        <Icon name="navigation" size={13} color={colors.textSecondary} />
                        <Text size={12} color={colors.textSecondary}>
                          {r.distance} km
                        </Text>
                        <Icon name="building-2" size={13} color={colors.textSecondary} />
                        <Text size={12} color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                          {r.drop}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <View style={styles.jobActions}>
                    {accepted ? (
                      <StatusBadge tone="success" dot={false} size="sm">
                        {myOffer?.acceptedBy
                          ? t('transportHome.acceptedBy', { name: myOffer.acceptedBy })
                          : t('transportHome.accepted')}
                      </StatusBadge>
                    ) : offered ? (
                      <>
                        <StatusBadge tone="info" dot={false} size="sm">
                          {t('transportHome.offered')}
                        </StatusBadge>
                        <Pressable
                          onPress={() => s.withdrawTransport(r.id)}
                          accessibilityRole="button"
                          style={[styles.offerBtn, styles.offerBtnOff]}
                        >
                          <Text size={13} weight={700} color={colors.textSecondary}>
                            {t('transportHome.withdraw')}
                          </Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => offer(r.id)}
                        accessibilityRole="button"
                        style={[styles.offerBtn, verified ? styles.offerBtnOn : styles.offerBtnWarn]}
                      >
                        <Text size={13} weight={700} color="#fff">
                          {verified ? t('transportHome.offerRide') : t('transportHome.verifyToOffer')}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {offeredCount > 0 && (
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: space[3] }}>
            {offeredCount === 1
              ? t('transportHome.offersSummaryOne', { accepted: acceptedCount })
              : t('transportHome.offersSummaryOther', { count: offeredCount, accepted: acceptedCount })}
          </Text>
        )}
      </View>

      <BottomSheet open={!!pickFor} title={t('transportHome.chooseVehicle')} onClose={() => setPickFor(null)}>
        <View style={{ gap: 10 }}>
          {availableVehicles.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => {
                if (pickFor) s.offerTransport(pickFor, v.id);
                setPickFor(null);
              }}
              accessibilityRole="button"
              style={styles.vehicleRow}
            >
              <View style={[styles.jobIcon, { backgroundColor: colors.brandSoft }]}>
                <Icon name={vIcon(v.type)} size={20} color={colors.brandStrong} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text size={14} weight={700}>
                  {v.type}
                </Text>
                <Text size={12} mono color={colors.textMuted}>
                  {v.plate}
                </Text>
              </View>
              <StatusBadge tone={v.pricing === 'free' ? 'success' : 'food'} dot={false} size="sm">
                {v.pricing === 'free' ? t('transportHome.free') : v.fare || t('transportHome.paid')}
              </StatusBadge>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  body: { paddingHorizontal: space[5], paddingTop: space[2] },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: space[3],
  },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  job: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
    gap: space[3],
  },
  jobMain: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  jobIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  jobActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: space[2] },
  offerBtn: { height: 38, paddingHorizontal: 16, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  offerBtnOn: { backgroundColor: colors.brand },
  offerBtnWarn: { backgroundColor: colors.warning },
  offerBtnOff: { backgroundColor: colors.surfaceCard, borderWidth: 1.5, borderColor: colors.borderStrong },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: space[3],
  },
});
