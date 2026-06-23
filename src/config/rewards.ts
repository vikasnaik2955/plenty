/**
 * Volunteer rewards — the single source of truth for tiers, point rules, badges,
 * and redeemable perks, plus the pure functions that compute a delivery's reward
 * and apply a redemption. Screens and the store read from here so the gamified
 * economy stays consistent and testable.
 *
 * Design note: `lifetimePoints` drives tier + point-threshold badges and never
 * decreases; the spendable `balance` is what perks deduct — so redeeming never
 * demotes a volunteer.
 */
import { palette } from '@/theme';
import { quarterKey, weekKey } from '@/utils/datetime';
import type { VolLedgerEntry, VolRewards } from '@/data/types';

// ---------------------------------------------------------------------------
// Point values
// ---------------------------------------------------------------------------
export const POINTS = {
  accept: 10,
  onTime: 15,
  pickupPhoto: 10,
  deliverPhoto: 10,
  complete: 40,
  perKm: 5,
  distanceCap: 50,
  foodBonus: 10,
  teammate: 15,
  shelter: 80,
  milestone4: 150,
  milestone12: 400,
  streakMultiplier: 1.5,
} as const;

/** Human-readable summary of how points are earned (shown on the rewards screen). */
export const POINT_RULES: { action: string; points: string; note: string }[] = [
  { action: 'Complete a delivery', points: '+40', note: 'Core payout when the drop-off is confirmed.' },
  { action: 'Accept a request', points: '+10', note: 'Posted on completion — accepting and dropping earns nothing.' },
  { action: 'On-time pickup', points: '+15', note: 'Pickup photo logged within the window.' },
  { action: 'Pickup + delivery photos', points: '+10 each', note: 'Proof the donor and shelter can see.' },
  { action: 'Distance travelled', points: '+5 / km (max +50)', note: 'Rewards longer hauls without paying wages.' },
  { action: 'Food run', points: '+10', note: 'Perishable food is time-critical.' },
  { action: 'Bring a teammate', points: '+15', note: 'Grow the corps and split the load.' },
  { action: 'Register a shelter', points: '+80', note: 'Put a new community on the map.' },
  { action: 'Weekly streak', points: '×1.5', note: 'Every run in a qualifying week earns 50% more.' },
  { action: 'Streak milestones', points: '+150 / +400', note: 'One-time at 4 and 12 weeks.' },
];

// ---------------------------------------------------------------------------
// Tiers
// ---------------------------------------------------------------------------
export interface VolTier {
  name: string;
  minPoints: number;
  icon: string;
  accent: string;
  perks: string[];
}

export const VOL_TIERS: VolTier[] = [
  { name: 'Sprout', minPoints: 0, icon: 'sprout', accent: palette.green400, perks: ['Verified volunteer status', 'Access to nearby requests', 'Welcome certificate on first delivery'] },
  { name: 'Helper', minPoints: 300, icon: 'star', accent: palette.teal500, perks: ['Helper badge', 'Sticker + enamel pin', 'Unlocks the ₹50 fuel voucher'] },
  { name: 'Pathfinder', minPoints: 900, icon: 'map-pin', accent: palette.blue500, perks: ['10-min priority head-start', '₹100 fuel/transport voucher', 'Signed appreciation certificate'] },
  { name: 'Guardian', minPoints: 2000, icon: 'shield-check', accent: palette.violet500, perks: ['“Trusted Volunteer” tag for donors', 'Free Plenty t-shirt', 'Lead teams of up to 3'] },
  { name: 'Beacon', minPoints: 4000, icon: 'trophy', accent: palette.gold500, perks: ['Permanent featured status', 'Quarterly meetup invite', 'Named on the Bandra community wall'] },
  { name: 'Legend', minPoints: 8000, icon: 'crown', accent: palette.orange500, perks: ['Lifetime Legend crown + Hall of Heroes', 'Story in the Plenty newsletter', 'Annual ₹2,000 charity match in your name'] },
];

export function tierIndexForPoints(points: number): number {
  let idx = 0;
  for (let i = 0; i < VOL_TIERS.length; i++) {
    if (points >= VOL_TIERS[i].minPoints) idx = i;
  }
  return idx;
}
export function tierForPoints(points: number): VolTier {
  return VOL_TIERS[tierIndexForPoints(points)];
}
export function nextTier(points: number): VolTier | null {
  return VOL_TIERS.find((t) => t.minPoints > points) ?? null;
}
/** 0..1 progress from the current tier floor to the next tier. 1 at max tier. */
export function tierProgress(points: number): number {
  const i = tierIndexForPoints(points);
  const cur = VOL_TIERS[i];
  const nxt = VOL_TIERS[i + 1];
  if (!nxt) return 1;
  return Math.max(0, Math.min(1, (points - cur.minPoints) / (nxt.minPoints - cur.minPoints)));
}

// ---------------------------------------------------------------------------
// Badges — criteria are a counter key + threshold, computable from VolRewards.
// ---------------------------------------------------------------------------
export type BadgeMetric =
  | 'deliveriesCompleted'
  | 'onTimePickups'
  | 'fullyDocumentedRuns'
  | 'totalDistanceKm'
  | 'foodDeliveries'
  | 'teammateRuns'
  | 'sheltersRegistered'
  | 'monsoonDeliveries'
  | 'longestWeeklyStreak'
  | 'lifetimePoints';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  metric: BadgeMetric;
  threshold: number;
  flavor: string;
  /** Short label of the goal, e.g. "10 deliveries". */
  goal: string;
}

export const BADGES: Badge[] = [
  { id: 'first_run', name: 'First Run', icon: 'gift', metric: 'deliveriesCompleted', threshold: 1, goal: '1 delivery', flavor: 'Your first delivery reached a shelter.' },
  { id: 'reliable_hands', name: 'Reliable Hands', icon: 'heart', metric: 'deliveriesCompleted', threshold: 10, goal: '10 deliveries', flavor: 'Ten families fed or clothed because you showed up.' },
  { id: 'clockwork', name: 'Clockwork', icon: 'calendar-check', metric: 'onTimePickups', threshold: 10, goal: '10 on-time pickups', flavor: 'Donors trust the volunteer who shows up on time.' },
  { id: 'proof_pro', name: 'Proof Pro', icon: 'shield-check', metric: 'fullyDocumentedRuns', threshold: 25, goal: '25 documented runs', flavor: 'Twenty-five runs, fully documented.' },
  { id: 'long_hauler', name: 'Long Hauler', icon: 'truck', metric: 'totalDistanceKm', threshold: 100, goal: '100 km', flavor: 'A hundred kilometres of surplus moved.' },
  { id: 'food_runner', name: 'Food Runner', icon: 'zap', metric: 'foodDeliveries', threshold: 15, goal: '15 food runs', flavor: 'Hot meals do not wait, and neither do you.' },
  { id: 'team_captain', name: 'Team Captain', icon: 'users', metric: 'teammateRuns', threshold: 10, goal: '10 team runs', flavor: 'You bring help with you and grow the corps.' },
  { id: 'shelter_scout', name: 'Shelter Scout', icon: 'map-pin', metric: 'sheltersRegistered', threshold: 1, goal: 'Register a shelter', flavor: 'You put a new shelter on the map.' },
  { id: 'spark', name: 'Spark', icon: 'flame', metric: 'longestWeeklyStreak', threshold: 4, goal: '4-week streak', flavor: 'Four weeks straight. The habit is catching fire.' },
  { id: 'monsoon_warrior', name: 'Monsoon Warrior', icon: 'cloud-rain', metric: 'monsoonDeliveries', threshold: 5, goal: '5 monsoon runs', flavor: 'You delivered through the rain.' },
  { id: 'centurion', name: 'Centurion', icon: 'medal', metric: 'deliveriesCompleted', threshold: 100, goal: '100 deliveries', flavor: 'A hundred runs. A hundred reasons someone ate today.' },
  { id: 'legend_crown', name: 'Legend', icon: 'crown', metric: 'lifetimePoints', threshold: 8000, goal: '8,000 points', flavor: 'The name shelters say with gratitude.' },
];

export function badgeEarned(badge: Badge, r: VolRewards): boolean {
  return (r[badge.metric] as number) >= badge.threshold;
}
export function earnedBadgeIds(r: VolRewards): string[] {
  return BADGES.filter((b) => badgeEarned(b, r)).map((b) => b.id);
}
/** The locked badge closest to unlocking (highest progress), for the "next badge" nudge. */
export function nextBadge(r: VolRewards): { badge: Badge; current: number; ratio: number } | null {
  const locked = BADGES.filter((b) => !badgeEarned(b, r));
  if (!locked.length) return null;
  let best = locked[0];
  let bestRatio = -1;
  for (const b of locked) {
    const ratio = Math.min(1, (r[b.metric] as number) / b.threshold);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = b;
    }
  }
  return { badge: best, current: r[best.metric] as number, ratio: Math.max(0, bestRatio) };
}

// ---------------------------------------------------------------------------
// Perks (rewards store)
// ---------------------------------------------------------------------------
export interface Perk {
  id: string;
  name: string;
  costPoints: number;
  minTierIndex: number;
  icon: string;
  description: string;
  /** Physical/one-off perks can only be redeemed once. */
  oncePerUser?: boolean;
}

export const PERKS: Perk[] = [
  { id: 'fuel_50', name: '₹50 Fuel Voucher', costPoints: 250, minTierIndex: 1, icon: 'fuel', description: 'Petrol / CNG voucher sent via code or UPI.' },
  { id: 'sticker_pack', name: 'Sticker + Enamel Pin', costPoints: 250, minTierIndex: 0, icon: 'sticker', description: 'A physical Plenty sticker and pin set.', oncePerUser: true },
  { id: 'certificate', name: 'Appreciation Certificate', costPoints: 400, minTierIndex: 2, icon: 'award', description: 'NGO-signed certificate with your deliveries & people fed.' },
  { id: 'fuel_100', name: '₹100 Fuel / Ride Voucher', costPoints: 600, minTierIndex: 2, icon: 'fuel', description: 'Larger voucher for petrol or a transport-partner ride.' },
  { id: 'featured_status', name: 'Featured Boost · 30 days', costPoints: 700, minTierIndex: 1, icon: 'sparkles', description: '“Trusted Volunteer” tag + a priority head-start for a month.' },
  { id: 'charity_match', name: 'Charity Match in Your Name', costPoints: 800, minTierIndex: 2, icon: 'heart', description: 'Plenty donates a meal pack to a shelter, credited to you.' },
  { id: 'tshirt', name: 'Plenty Volunteer T-Shirt', costPoints: 1000, minTierIndex: 3, icon: 'shirt', description: 'The official green Plenty tee, mailed to you.', oncePerUser: true },
  { id: 'meetup_invite', name: 'Volunteer Meetup Pass', costPoints: 1200, minTierIndex: 3, icon: 'ticket', description: 'A seat at the next quarterly Plenty volunteer meetup.', oncePerUser: true },
];

export type RedeemBlock = 'points' | 'tier' | 'redeemed' | null;
/** Why a perk can't be redeemed right now (null = redeemable). */
export function redeemBlock(perk: Perk, r: VolRewards, lifetimePoints: number): RedeemBlock {
  if (perk.oncePerUser && r.redeemed.some((x) => x.id === perk.id)) return 'redeemed';
  if (tierIndexForPoints(lifetimePoints) < perk.minTierIndex) return 'tier';
  if (r.balance < perk.costPoints) return 'points';
  return null;
}

// ---------------------------------------------------------------------------
// People-fed estimate helper
// ---------------------------------------------------------------------------
export function isMonsoon(ms: number): boolean {
  const m = new Date(ms).getMonth();
  return m >= 5 && m <= 8; // Jun–Sep (IST monsoon)
}

// ---------------------------------------------------------------------------
// Delivery reward computation (pure)
// ---------------------------------------------------------------------------
export interface RewardLineItem {
  label: string;
  points: number;
}
export interface DeliveryReward {
  items: RewardLineItem[];
  base: number;
  multiplier: number;
  multiplierBonus: number;
  milestoneBonus: number;
  milestoneLabel?: string;
  total: number;
  newBadges: Badge[];
  weeklyStreak: number;
  streakQualified: boolean;
  deliveriesThisWeek: number;
}

/** Minimal shape of the finished task needed to score a delivery. */
export interface ScoredTask {
  title?: string;
  category: 'food' | 'clothes';
  distance: number;
  people?: number;
  proofs?: Record<string, unknown>;
  team?: unknown[];
}

const DAY = 86400000;

/**
 * Compute the reward for completing `task` given the previous rewards state.
 * Returns the next state plus an itemized breakdown for the celebration UI.
 */
export function computeDeliveryReward(
  prev: VolRewards,
  task: ScoredTask,
  now: number,
): { next: VolRewards; reward: DeliveryReward } {
  const hasPickupProof = !!task.proofs?.picked_up;
  const hasDeliverProof = !!task.proofs?.delivered;
  const hasTeam = (task.team?.length ?? 0) > 0;
  const isFood = task.category === 'food';

  const items: RewardLineItem[] = [];
  items.push({ label: 'Delivery completed', points: POINTS.complete });
  items.push({ label: 'Accepted the request', points: POINTS.accept });
  if (hasPickupProof) items.push({ label: 'On-time pickup', points: POINTS.onTime });
  if (hasPickupProof) items.push({ label: 'Pickup photo proof', points: POINTS.pickupPhoto });
  if (hasDeliverProof) items.push({ label: 'Delivery photo proof', points: POINTS.deliverPhoto });
  const distPts = Math.min(POINTS.distanceCap, Math.round(task.distance * POINTS.perKm));
  if (distPts > 0) items.push({ label: `Distance · ${task.distance} km`, points: distPts });
  if (isFood) items.push({ label: 'Food run bonus', points: POINTS.foodBonus });
  if (hasTeam) items.push({ label: 'Brought a teammate', points: POINTS.teammate });

  const base = items.reduce((s, i) => s + i.points, 0);

  // --- Weekly streak ---
  const wk = weekKey(now);
  const sameWeek = prev.currentWeekKey === wk;
  const deliveriesThisWeek = sameWeek ? prev.deliveriesThisWeek + 1 : 1;

  let weeklyStreak = prev.weeklyStreak;
  let longestWeeklyStreak = prev.longestWeeklyStreak;
  let lastQualifiedWeekKey = prev.lastQualifiedWeekKey;
  let graceQuarterUsed = prev.graceQuarterUsed;
  let milestonesAwarded = prev.milestonesAwarded;
  let milestoneBonus = 0;
  let milestoneLabel: string | undefined;

  // The week qualifies the moment it reaches its 2nd delivery.
  if (deliveriesThisWeek === 2) {
    const prevWeek = wk - 7 * DAY;
    const gapWeek = wk - 14 * DAY;
    const q = quarterKey(now);
    if (lastQualifiedWeekKey === prevWeek) {
      weeklyStreak = prev.weeklyStreak + 1;
    } else if (lastQualifiedWeekKey === gapWeek && graceQuarterUsed !== q) {
      weeklyStreak = prev.weeklyStreak + 1; // grace week covers a single gap
      graceQuarterUsed = q;
    } else {
      weeklyStreak = 1;
    }
    lastQualifiedWeekKey = wk;
    longestWeeklyStreak = Math.max(longestWeeklyStreak, weeklyStreak);
    // Accumulate labels so that if both milestones ever land on one delivery the
    // ledger/celebration reads "4-week & 12-week streak" (not just the last one).
    const milestoneLabels: string[] = [];
    if (weeklyStreak >= 4 && !milestonesAwarded.includes(4)) {
      milestoneBonus += POINTS.milestone4;
      milestoneLabels.push('4-week streak');
      milestonesAwarded = [...milestonesAwarded, 4];
    }
    if (weeklyStreak >= 12 && !milestonesAwarded.includes(12)) {
      milestoneBonus += POINTS.milestone12;
      milestoneLabels.push('12-week streak');
      milestonesAwarded = [...milestonesAwarded, 12];
    }
    if (milestoneLabels.length) milestoneLabel = milestoneLabels.join(' & ');
  }

  // x1.5 applies to every run once the week is qualifying (2nd run onward).
  const qualifying = deliveriesThisWeek >= 2;
  const multiplier = qualifying ? POINTS.streakMultiplier : 1;
  const multiplierBonus = Math.round(base * (multiplier - 1));
  const total = base + multiplierBonus + milestoneBonus;

  const ledger: VolLedgerEntry[] = [
    {
      id: `vr-${now}`,
      reason: `${task.title || 'Delivery'} delivered`,
      delta: base + multiplierBonus,
      at: now,
      kind: 'earn',
    },
    ...prev.ledger,
  ];
  if (milestoneBonus > 0) {
    ledger.unshift({ id: `vr-${now}-m`, reason: `${milestoneLabel} bonus`, delta: milestoneBonus, at: now, kind: 'bonus' });
  }

  const next: VolRewards = {
    ...prev,
    lifetimePoints: prev.lifetimePoints + total,
    balance: prev.balance + total,
    deliveriesCompleted: prev.deliveriesCompleted + 1,
    peopleFed: prev.peopleFed + (task.people ?? 0),
    onTimePickups: prev.onTimePickups + (hasPickupProof ? 1 : 0),
    fullyDocumentedRuns: prev.fullyDocumentedRuns + (hasPickupProof && hasDeliverProof ? 1 : 0),
    totalDistanceKm: prev.totalDistanceKm + task.distance,
    foodDeliveries: prev.foodDeliveries + (isFood ? 1 : 0),
    teammateRuns: prev.teammateRuns + (hasTeam ? 1 : 0),
    monsoonDeliveries: prev.monsoonDeliveries + (isMonsoon(now) ? 1 : 0),
    deliveriesThisWeek,
    currentWeekKey: wk,
    lastQualifiedWeekKey,
    weeklyStreak,
    longestWeeklyStreak,
    graceQuarterUsed,
    milestonesAwarded,
    ledger,
  };

  const before = new Set(prev.badges);
  const earned = earnedBadgeIds(next);
  next.badges = Array.from(new Set([...prev.badges, ...earned]));
  const newBadges = earned.filter((id) => !before.has(id)).map((id) => BADGES.find((b) => b.id === id)!).filter(Boolean);

  return {
    next,
    reward: {
      items,
      base,
      multiplier,
      multiplierBonus,
      milestoneBonus,
      milestoneLabel,
      total,
      newBadges,
      weeklyStreak,
      streakQualified: qualifying,
      deliveriesThisWeek,
    },
  };
}

/** Apply a perk redemption (pure). Returns ok=false with a reason when blocked. */
export function applyRedeem(
  prev: VolRewards,
  perk: Perk,
  lifetimePoints: number,
  now: number,
): { ok: boolean; reason?: string; next?: VolRewards } {
  const block = redeemBlock(perk, prev, lifetimePoints);
  if (block === 'redeemed') return { ok: false, reason: 'Already redeemed' };
  if (block === 'tier') return { ok: false, reason: `Reach ${VOL_TIERS[perk.minTierIndex].name} first` };
  if (block === 'points') return { ok: false, reason: 'Not enough points' };
  const next: VolRewards = {
    ...prev,
    balance: prev.balance - perk.costPoints,
    redeemed: [...prev.redeemed, { id: perk.id, at: now }],
    ledger: [{ id: `rd-${now}`, reason: `Redeemed ${perk.name}`, delta: -perk.costPoints, at: now, kind: 'redeem' }, ...prev.ledger],
  };
  return { ok: true, next };
}
