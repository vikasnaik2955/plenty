/**
 * App store — the single source of runtime state, replacing the prototype's
 * `App` component state and handlers (enterRole, confirmSend, acceptRequest,
 * updateVolTask, …) from `ui_kits/plenty-app/app.jsx`.
 *
 * Data is loaded once through the repository boundary (mock today, API later).
 * Bug-fixes from the plan live here: real/consistent lifecycle transitions,
 * removing an accepted request from the open broadcast list, and derived stats
 * instead of hardcoded literals.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { repository } from '@/data/repository';
import { INITIAL_PROFILES, MOCK_DATA } from '@/data/mock';
import { STATUS_LABEL } from '@/theme';
import { threadId, type ThreadReads, type Threads } from '@/utils/chat';
import { monthKey, weekKey } from '@/utils/datetime';
import {
  applyRedeem,
  computeDeliveryReward,
  earnedBadgeIds,
  POINTS,
  type DeliveryReward,
  type Perk,
  type ScoredTask,
} from '@/config/rewards';
import type {
  ActiveAllocation,
  AppNotification,
  Category,
  ChatMessage,
  Consumer,
  Donation,
  NewShelterInput,
  NotificationType,
  PlentyData,
  Profile,
  ProofPhotos,
  Role,
  SavedAddress,
  Status,
  TaskHelper,
  Transport,
  TransportOffer,
  TransportVehicle,
  TransportVerification,
  Volunteer,
  VolunteerTask,
  VolRewards,
} from '@/data/types';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';
export interface ToastState {
  message: string;
  tone: ToastTone;
}

export interface DonationDraft {
  category: Category;
  needsVolunteer?: boolean | null;
  title?: string;
  note?: string;
  serves?: number;
  pieces?: string;
  photo?: string | null;
}

type Profiles = Record<Role, Profile>;

interface AppState {
  data: PlentyData;
  role: Role | null;
  pendingRole: Role | null;
  draft: DonationDraft;
  allocation: ActiveAllocation | null;
  proofs: ProofPhotos;
  volActive: VolunteerTask[];
  volTaskId: string | null;
  team: Volunteer[];
  suggestions: Volunteer[];
  profiles: Profiles;
  /** Counters that back the donor dashboard stats (seeded to the prototype's numbers). */
  rewardPoints: number;
  peopleHelped: number;
  /** Epoch ms the consumer last updated their registered need. */
  needUpdatedAt: number | null;
  /** Chat conversations keyed by sorted participant names. */
  threads: Threads;
  /** Per-thread, per-participant last-read timestamps (for unread counts). */
  threadReads: ThreadReads;
  /** The transport user's own vehicles (add/edit/delete, each with pricing). */
  transportVehicles: TransportVehicle[];
  /** Whether the transport provider is online (receiving jobs). */
  transportOnline: boolean;
  /** Transport provider identity/license verification. */
  transportVerification: TransportVerification;
  /** Ride offers from transport providers, visible to volunteers and donors. */
  transportOffers: TransportOffer[];
  /** Role-targeted notifications about the ongoing task. */
  notifications: AppNotification[];
  /** Month these donation counts are for ("YYYY-M"); resets when the month rolls. */
  donationMonthKey: string;
  /** Per-recipient donations received this month, by category (keyed by name). */
  donationCounts: Record<string, { food: number; clothes: number }>;
  /** Saved addresses (profile → Saved addresses). */
  addresses: SavedAddress[];
  /** Selected app language (preference). */
  language: string;
  /** Push notifications preference. */
  pushEnabled: boolean;
  /** The volunteer's rewards: points, tier inputs, streak, badges, perks, ledger. */
  volRewards: VolRewards;
}

// The prototype shows 1,240 points and 38 people helped on the donor home.
// We seed those as the baseline and grow them as donations complete, instead
// of hardcoding the literals in the screen.
const REWARD_BASE = 1240;
const PEOPLE_BASE = 38;

// "Finding a volunteer" simulation window. A nearby volunteer responds after a
// random delay; if that delay runs past the window the request is auto-cancelled
// (no one accepted in time) so the donor never waits forever on a stale request.
const ACCEPT_WINDOW_MS = 20_000; // how long we wait before auto-cancelling
const ACCEPT_MIN_MS = 4_000; // earliest a volunteer might respond
const ACCEPT_MAX_MS = 26_000; // latest — beyond the window means no one accepts in time
const AUTO_CANCEL_REASON =
  'No nearby volunteer accepted in time — they may all be busy right now. Please try again, or hand it over yourself.';

/**
 * Seed the volunteer rewards to a believable veteran state (matches the home's
 * old "3,480 points / 132 trips" literals) so the tier, badges, streak, and
 * ledger all look earned from the first launch.
 */
function seedVolRewards(): VolRewards {
  const now = Date.now();
  const DAY = 86400000;
  const HOUR = 3600000;
  const r: VolRewards = {
    lifetimePoints: 3480,
    balance: 3480,
    deliveriesCompleted: 132,
    peopleFed: 612,
    onTimePickups: 121,
    fullyDocumentedRuns: 96,
    totalDistanceKm: 540,
    foodDeliveries: 79,
    teammateRuns: 14,
    sheltersRegistered: 0,
    monsoonDeliveries: 3,
    deliveriesThisWeek: 1,
    currentWeekKey: weekKey(now),
    lastQualifiedWeekKey: weekKey(now) - 7 * DAY,
    weeklyStreak: 3,
    longestWeeklyStreak: 7,
    graceQuarterUsed: null,
    milestonesAwarded: [4],
    badges: [],
    redeemed: [],
    ledger: [
      { id: 'vl-seed-1', reason: 'Winter jackets delivered', delta: 85, at: now - 26 * HOUR, kind: 'earn' },
      { id: 'vl-seed-2', reason: 'Packaged rice & dal delivered', delta: 95, at: now - 2 * DAY, kind: 'earn' },
      { id: 'vl-seed-3', reason: 'Cooked meals delivered', delta: 70, at: now - 5 * DAY, kind: 'earn' },
      { id: 'vl-seed-4', reason: '4-week streak bonus', delta: 150, at: now - 9 * DAY, kind: 'bonus' },
    ],
  };
  r.badges = earnedBadgeIds(r);
  return r;
}

function initialState(): AppState {
  const V = MOCK_DATA.VOLUNTEERS;
  return {
    data: MOCK_DATA,
    role: null,
    pendingRole: null,
    draft: { category: 'food' },
    allocation: null,
    proofs: {},
    volActive: [],
    volTaskId: null,
    team: V.slice(0, 2),
    suggestions: V.slice(2).map((v) => ({ ...v, distance: Math.round((v.distance + 6) * 10) / 10 })),
    profiles: structuredCloneSafe(INITIAL_PROFILES) as Profiles,
    rewardPoints: REWARD_BASE,
    peopleHelped: PEOPLE_BASE,
    needUpdatedAt: null,
    // Seed one donor↔volunteer conversation so the cross-account flow is visible
    // immediately: the donor sees Ravi's message; switch to the volunteer role to
    // see the same thread and reply.
    threads: {
      [threadId('Asha Verma', 'Ravi Kumar')]: [
        {
          id: 'msg-seed-0a',
          from: 'Asha Verma',
          text: 'Hi Ravi, thanks for helping with the deliveries!',
          at: Date.now() - 1000 * 60 * 60 * 26,
        },
        {
          id: 'msg-seed-0b',
          from: 'Ravi Kumar',
          text: 'Happy to help anytime. 🙂',
          at: Date.now() - 1000 * 60 * 60 * 26 + 90000,
        },
        {
          id: 'msg-seed-1',
          from: 'Ravi Kumar',
          text: "Hi Asha! I'm Ravi, your volunteer. I'll head over for pickup shortly.",
          at: Date.now() - 1000 * 60 * 12,
        },
      ],
    },
    threadReads: {},
    transportVehicles: [
      { id: 'tv-1', type: 'Auto rickshaw', plate: 'MH 02 EF 7781', pricing: 'free', available: true },
      { id: 'tv-2', type: 'Two-wheeler', plate: 'MH 02 GH 5521', pricing: 'paid', fare: '₹80', available: true },
    ],
    transportOnline: true,
    transportVerification: {
      status: 'unverified',
      fullName: 'Salim Shaikh',
      license: '',
      contact: '+91 98111 90210',
    },
    transportOffers: [],
    notifications: MOCK_DATA.NOTIFICATIONS.map((n, i) => ({
      ...n,
      at: Date.now() - [2, 18, 1440, 2880][i] * 60000,
      audience: ['donor'] as Role[],
    })),
    donationMonthKey: monthKey(),
    // Seeded so some recipients clearly need more support this month than others.
    donationCounts: {
      'Hope Shelter': { food: 6, clothes: 2 },
      'Asha Sadan NGO': { food: 1, clothes: 1 },
      'Seva Kitchen': { food: 4, clothes: 1 },
      'Little Stars Home': { food: 0, clothes: 1 },
    },
    addresses: [
      { id: 'addr-home', label: 'Home', address: '12 Carter Rd, Bandra West, Mumbai 400050', isDefault: true },
    ],
    language: 'English',
    pushEnabled: true,
    volRewards: seedVolRewards(),
  };
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

type Action =
  | { type: 'SET_DATA'; data: PlentyData }
  | { type: 'SET_ROLE'; role: Role | null }
  | { type: 'SET_PENDING_ROLE'; role: Role | null }
  | { type: 'SET_DRAFT'; patch: Partial<DonationDraft> }
  | { type: 'RESET_DRAFT' }
  | { type: 'SET_ALLOCATION'; allocation: ActiveAllocation | null }
  | { type: 'ADVANCE_ALLOCATION'; status: Status; at: number }
  | { type: 'CANCEL_ALLOCATION'; reason: string; at: number }
  | { type: 'REARM_ALLOCATION'; at: number; expiresAt: number }
  | { type: 'ADD_PROOF'; status: string; uri: string; at: number }
  | { type: 'CLEAR_PROOFS' }
  | { type: 'ACCEPT_REQUEST'; requestId: string; at: number }
  | { type: 'SET_VOL_TASK'; id: string | null }
  | { type: 'UPDATE_VOL_TASK'; id: string; patch: Partial<VolunteerTask>; at?: number }
  | { type: 'SET_NEED_UPDATED'; at: number }
  | { type: 'SEND_MESSAGE'; threadId: string; message: ChatMessage; reader: string; at: number }
  | { type: 'EDIT_MESSAGE'; threadId: string; messageId: string; text: string }
  | { type: 'MARK_THREAD_READ'; threadId: string; reader: string; at: number }
  | { type: 'SET_TRANSPORT_ONLINE'; online: boolean }
  | { type: 'ADD_VEHICLE'; vehicle: TransportVehicle }
  | { type: 'UPDATE_VEHICLE'; id: string; patch: Partial<TransportVehicle> }
  | { type: 'REMOVE_VEHICLE'; id: string }
  | { type: 'SUBMIT_VERIFICATION'; patch: Partial<TransportVerification> }
  | { type: 'SET_VERIFICATION_STATUS'; status: TransportVerification['status'] }
  | { type: 'OFFER_TRANSPORT'; offer: TransportOffer }
  | { type: 'WITHDRAW_TRANSPORT'; jobId: string; provider: string }
  | { type: 'ACCEPT_TRANSPORT_OFFER'; offerId: string; volunteer: string; transport: Transport }
  | { type: 'PUSH_NOTIFICATION'; notif: AppNotification }
  | { type: 'MARK_NOTIFICATIONS_READ'; role: Role }
  | { type: 'ADD_ADDRESS'; address: SavedAddress }
  | { type: 'UPDATE_ADDRESS'; id: string; patch: Partial<SavedAddress> }
  | { type: 'REMOVE_ADDRESS'; id: string }
  | { type: 'SET_DEFAULT_ADDRESS'; id: string }
  | { type: 'SET_LANGUAGE'; language: string }
  | { type: 'SET_PUSH'; enabled: boolean }
  | { type: 'COUNT_DONATION'; name: string; category: Category; monthKey: string }
  | { type: 'ASSIGN_ALLOCATION_VOLUNTEER'; helper: TaskHelper }
  | { type: 'REMOVE_ALLOCATION_VOLUNTEER'; helperId: string }
  | { type: 'ADD_TASK_TEAMMATE'; taskId: string; helper: TaskHelper }
  | { type: 'REMOVE_TASK_TEAMMATE'; taskId: string; helperId: string }
  | { type: 'ADD_TO_TEAM'; volunteer: Volunteer }
  | { type: 'ADD_MEMBER'; volunteer: Volunteer }
  | { type: 'ADD_CONSUMER'; consumer: Consumer }
  | { type: 'UPDATE_DONATION'; id: string; patch: Partial<Donation> }
  | { type: 'UPDATE_PROFILE'; role: Role; patch: Partial<Profile> }
  | { type: 'COMPLETE_DONATION'; points: number; people: number }
  | { type: 'SET_VOL_REWARDS'; rewards: VolRewards }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.data };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_PENDING_ROLE':
      return { ...state, pendingRole: action.role };
    case 'SET_DRAFT':
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case 'RESET_DRAFT':
      return { ...state, draft: { category: 'food' } };
    case 'SET_ALLOCATION':
      return { ...state, allocation: action.allocation };
    case 'ADVANCE_ALLOCATION':
      return state.allocation
        ? {
            ...state,
            allocation: {
              ...state.allocation,
              current: action.status,
              // Once it moves past "requested" the wait window no longer applies.
              expiresAt: undefined,
              timestamps: { ...state.allocation.timestamps, [action.status]: action.at },
            },
          }
        : state;
    case 'CANCEL_ALLOCATION':
      return state.allocation
        ? {
            ...state,
            allocation: {
              ...state.allocation,
              current: 'cancelled',
              cancelReason: action.reason,
              expiresAt: undefined,
              timestamps: { ...state.allocation.timestamps, cancelled: action.at },
            },
          }
        : state;
    case 'REARM_ALLOCATION':
      // Donor retries a cancelled request: back to "requested" with a fresh window.
      return state.allocation
        ? {
            ...state,
            allocation: {
              ...state.allocation,
              current: 'requested',
              cancelReason: undefined,
              expiresAt: action.expiresAt,
              timestamps: {
                ...state.allocation.timestamps,
                requested: action.at,
                accepted: undefined,
                cancelled: undefined,
              },
            },
          }
        : state;
    case 'ADD_PROOF':
      return {
        ...state,
        proofs: { ...state.proofs, [action.status]: { uri: action.uri, at: action.at } },
      };
    case 'CLEAR_PROOFS':
      return { ...state, proofs: {} };
    case 'ACCEPT_REQUEST': {
      const req = state.data.OPEN_REQUESTS.find((r) => r.id === action.requestId);
      if (!req) return state;
      const already = state.volActive.some((t) => t.id === req.id);
      return {
        ...state,
        // Bug-fix: remove the accepted request from the open broadcast list so
        // other volunteers no longer see it.
        data: {
          ...state.data,
          OPEN_REQUESTS: state.data.OPEN_REQUESTS.filter((r) => r.id !== req.id),
        },
        volActive: already
          ? state.volActive
          : [
              ...state.volActive,
              { ...req, current: 'accepted', proofs: {}, timestamps: { accepted: action.at } },
            ],
        volTaskId: req.id,
      };
    }
    case 'SET_VOL_TASK':
      return { ...state, volTaskId: action.id };
    case 'UPDATE_VOL_TASK':
      return {
        ...state,
        volActive: state.volActive.map((t) => {
          if (t.id !== action.id) return t;
          const next: VolunteerTask = { ...t, ...action.patch };
          // Stamp the time when the task advances to a new lifecycle stage.
          if (action.patch.current && action.at != null) {
            next.timestamps = { ...t.timestamps, [action.patch.current]: action.at };
          }
          return next;
        }),
      };
    case 'ADD_TO_TEAM':
      return {
        ...state,
        team: [...state.team, action.volunteer],
        suggestions: state.suggestions.filter((x) => x.id !== action.volunteer.id),
      };
    case 'ADD_MEMBER':
      return { ...state, team: [...state.team, action.volunteer] };
    case 'ADD_CONSUMER':
      return {
        ...state,
        // New recipient shows at the top of the nearby list, so the donor sees
        // the one they just registered first.
        data: { ...state.data, CONSUMERS: [action.consumer, ...state.data.CONSUMERS] },
      };
    case 'SET_NEED_UPDATED':
      return { ...state, needUpdatedAt: action.at };
    case 'PUSH_NOTIFICATION':
      return { ...state, notifications: [action.notif, ...state.notifications] };
    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          !n.audience || n.audience.includes(action.role) ? { ...n, unread: false } : n,
        ),
      };
    case 'ADD_ADDRESS': {
      // First address added becomes the default automatically.
      const makeDefault = action.address.isDefault || state.addresses.length === 0;
      const addresses = makeDefault
        ? state.addresses.map((a) => ({ ...a, isDefault: false }))
        : state.addresses;
      return { ...state, addresses: [...addresses, { ...action.address, isDefault: makeDefault }] };
    }
    case 'UPDATE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      };
    case 'REMOVE_ADDRESS': {
      const remaining = state.addresses.filter((a) => a.id !== action.id);
      // If we removed the default, promote the first remaining address.
      if (remaining.length && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return { ...state, addresses: remaining };
    }
    case 'SET_DEFAULT_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === action.id })),
      };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_PUSH':
      return { ...state, pushEnabled: action.enabled };
    case 'COUNT_DONATION': {
      // Roll over (reset all counts) when a new month begins.
      const counts = action.monthKey === state.donationMonthKey ? state.donationCounts : {};
      const cur = counts[action.name] ?? { food: 0, clothes: 0 };
      return {
        ...state,
        donationMonthKey: action.monthKey,
        donationCounts: {
          ...counts,
          [action.name]: { ...cur, [action.category]: cur[action.category] + 1 },
        },
      };
    }
    case 'UPDATE_DONATION':
      return {
        ...state,
        data: {
          ...state.data,
          DONATIONS: state.data.DONATIONS.map((d) =>
            d.id === action.id ? { ...d, ...action.patch } : d,
          ),
        },
      };
    case 'SEND_MESSAGE': {
      const existing = state.threads[action.threadId] ?? [];
      return {
        ...state,
        threads: { ...state.threads, [action.threadId]: [...existing, action.message] },
        // The sender has implicitly read everything up to now.
        threadReads: {
          ...state.threadReads,
          [action.threadId]: { ...state.threadReads[action.threadId], [action.reader]: action.at },
        },
      };
    }
    case 'EDIT_MESSAGE': {
      const thread = state.threads[action.threadId];
      if (!thread) return state;
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.threadId]: thread.map((m) =>
            m.id === action.messageId ? { ...m, text: action.text, edited: true } : m,
          ),
        },
      };
    }
    case 'MARK_THREAD_READ':
      return {
        ...state,
        threadReads: {
          ...state.threadReads,
          [action.threadId]: { ...state.threadReads[action.threadId], [action.reader]: action.at },
        },
      };
    case 'SET_TRANSPORT_ONLINE':
      return { ...state, transportOnline: action.online };
    case 'ADD_VEHICLE':
      return { ...state, transportVehicles: [...state.transportVehicles, action.vehicle] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        transportVehicles: state.transportVehicles.map((v) =>
          v.id === action.id ? { ...v, ...action.patch } : v,
        ),
      };
    case 'REMOVE_VEHICLE':
      return {
        ...state,
        transportVehicles: state.transportVehicles.filter((v) => v.id !== action.id),
      };
    case 'SUBMIT_VERIFICATION':
      return {
        ...state,
        transportVerification: { ...state.transportVerification, ...action.patch, status: 'pending' },
      };
    case 'SET_VERIFICATION_STATUS':
      return {
        ...state,
        transportVerification: { ...state.transportVerification, status: action.status },
      };
    case 'OFFER_TRANSPORT':
      return { ...state, transportOffers: [...state.transportOffers, action.offer] };
    case 'WITHDRAW_TRANSPORT':
      return {
        ...state,
        transportOffers: state.transportOffers.filter(
          (o) => !(o.jobId === action.jobId && o.provider === action.provider && !o.accepted),
        ),
      };
    case 'ACCEPT_TRANSPORT_OFFER': {
      const offer = state.transportOffers.find((o) => o.id === action.offerId);
      if (!offer) return state;
      return {
        ...state,
        // Mark the chosen offer accepted; drop other open offers for that job.
        transportOffers: state.transportOffers
          .filter((o) => o.jobId !== offer.jobId || o.id === offer.id || o.accepted)
          .map((o) =>
            o.id === offer.id ? { ...o, accepted: true, acceptedBy: action.volunteer } : o,
          ),
        // Attach the vehicle to the volunteer's task.
        volActive: state.volActive.map((t) =>
          t.id === offer.jobId ? { ...t, transport: action.transport } : t,
        ),
      };
    }
    case 'ASSIGN_ALLOCATION_VOLUNTEER': {
      if (!state.allocation) return state;
      const team = state.allocation.team ?? [];
      if (team.some((h) => h.id === action.helper.id)) return state;
      return { ...state, allocation: { ...state.allocation, team: [...team, action.helper] } };
    }
    case 'REMOVE_ALLOCATION_VOLUNTEER': {
      if (!state.allocation) return state;
      return {
        ...state,
        allocation: {
          ...state.allocation,
          team: (state.allocation.team ?? []).filter((h) => h.id !== action.helperId),
        },
      };
    }
    case 'ADD_TASK_TEAMMATE':
      return {
        ...state,
        volActive: state.volActive.map((t) => {
          if (t.id !== action.taskId) return t;
          const team = t.team ?? [];
          if (team.some((h) => h.id === action.helper.id)) return t;
          return { ...t, team: [...team, action.helper] };
        }),
      };
    case 'REMOVE_TASK_TEAMMATE':
      return {
        ...state,
        volActive: state.volActive.map((t) =>
          t.id === action.taskId ? { ...t, team: (t.team ?? []).filter((h) => h.id !== action.helperId) } : t,
        ),
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [action.role]: { ...state.profiles[action.role], ...action.patch },
        },
      };
    case 'COMPLETE_DONATION':
      return {
        ...state,
        rewardPoints: state.rewardPoints + action.points,
        peopleHelped: state.peopleHelped + action.people,
      };
    case 'SET_VOL_REWARDS':
      return { ...state, volRewards: action.rewards };
    case 'RESET':
      return { ...initialState(), data: state.data };
    default:
      return state;
  }
}

export interface AppStore extends AppState {
  // toast
  toast: ToastState | null;
  showToast: (message: string, tone?: ToastTone) => void;
  // role / nav-adjacent
  setRole: (role: Role | null) => void;
  setPendingRole: (role: Role | null) => void;
  reset: () => void;
  // donor flow
  setDraft: (patch: Partial<DonationDraft>) => void;
  resetDraft: () => void;
  confirmSend: (consumer: Consumer) => void;
  retryAllocation: () => void;
  withdrawAllocation: () => void;
  setAllocation: (a: ActiveAllocation | null) => void;
  advanceAllocation: (status: Status) => void;
  addProof: (status: string, uri: string) => void; // stamps the upload time
  // volunteer flow
  acceptRequest: (requestId: string) => void;
  setVolTask: (id: string | null) => void;
  updateVolTask: (id: string, patch: Partial<VolunteerTask>) => void;
  advanceVolTask: (id: string, status: Status) => void;
  // volunteer rewards
  awardDelivery: (task: ScoredTask) => DeliveryReward;
  redeemPerk: (perk: Perk) => boolean;
  // team
  addToTeam: (v: Volunteer) => void;
  addMember: (v: Volunteer) => void;
  // recipients
  addConsumer: (input: NewShelterInput) => Consumer;
  // donations
  updateDonation: (id: string, patch: Partial<Donation>) => void;
  // notifications
  markNotificationsRead: (role: Role) => void;
  // profile settings
  addAddress: (input: { label: string; address: string }) => void;
  updateAddress: (id: string, patch: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setLanguage: (language: string) => void;
  setPushEnabled: (enabled: boolean) => void;
  // consumer need
  markNeedUpdated: () => void;
  // chat
  sendMessage: (from: string, to: string, text: string) => void;
  editMessage: (me: string, other: string, messageId: string, text: string) => void;
  markThreadRead: (me: string, other: string) => void;
  // transport
  setTransportOnline: (online: boolean) => void;
  addVehicle: (v: Omit<TransportVehicle, 'id'>) => void;
  updateVehicle: (id: string, patch: Partial<TransportVehicle>) => void;
  removeVehicle: (id: string) => void;
  submitVerification: (patch: Partial<TransportVerification>) => void;
  offerTransport: (jobId: string, vehicleId: string) => void;
  withdrawTransport: (jobId: string) => void;
  acceptTransportOffer: (offer: TransportOffer) => void;
  // delivery teams (multiple volunteers per task)
  assignAllocationVolunteer: (helper: TaskHelper) => void;
  removeAllocationVolunteer: (helperId: string) => void;
  addTaskTeammate: (taskId: string, helper: TaskHelper) => void;
  removeTaskTeammate: (taskId: string, helperId: string) => void;
  // profile
  updateProfile: (role: Role, patch: Partial<Profile>) => void;
  // derived
  activeTask: VolunteerTask | null;
}

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  // Always-current snapshot for callbacks that read latest state without deps.
  const stateRef = useRef(state);
  stateRef.current = state;
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acceptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monotonic id source for entities created in-app (recipients, etc.).
  const idSeq = useRef(1);

  // Load data through the repository boundary once on mount.
  useEffect(() => {
    let alive = true;
    repository.fetchAll().then((data) => {
      if (alive) dispatch({ type: 'SET_DATA', data });
    });
    return () => {
      alive = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (acceptTimer.current) clearTimeout(acceptTimer.current);
      if (cancelTimer.current) clearTimeout(cancelTimer.current);
      if (verifyTimer.current) clearTimeout(verifyTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast({ message, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Raise a role-targeted notification about the ongoing task.
  const pushNotification = useCallback(
    (type: NotificationType, title: string, message: string, audience: Role[]) => {
      dispatch({
        type: 'PUSH_NOTIFICATION',
        notif: { id: `nt-${idSeq.current++}`, type, title, message, at: Date.now(), unread: true, audience },
      });
    },
    [],
  );
  const markNotificationsRead = useCallback(
    (role: Role) => dispatch({ type: 'MARK_NOTIFICATIONS_READ', role }),
    [],
  );

  const addAddress = useCallback(
    (input: { label: string; address: string }) => {
      dispatch({
        type: 'ADD_ADDRESS',
        address: { id: `addr-${idSeq.current++}`, label: input.label.trim(), address: input.address.trim() },
      });
      showToast('Address saved', 'success');
    },
    [showToast],
  );
  const updateAddress = useCallback(
    (id: string, patch: Partial<SavedAddress>) => {
      dispatch({ type: 'UPDATE_ADDRESS', id, patch });
      showToast('Address updated', 'success');
    },
    [showToast],
  );
  const removeAddress = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ADDRESS', id });
  }, []);
  const setDefaultAddress = useCallback((id: string) => dispatch({ type: 'SET_DEFAULT_ADDRESS', id }), []);
  const setLanguage = useCallback((language: string) => dispatch({ type: 'SET_LANGUAGE', language }), []);
  const setPushEnabled = useCallback((enabled: boolean) => dispatch({ type: 'SET_PUSH', enabled }), []);

  const setRole = useCallback((role: Role | null) => dispatch({ type: 'SET_ROLE', role }), []);
  const setPendingRole = useCallback(
    (role: Role | null) => dispatch({ type: 'SET_PENDING_ROLE', role }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const setDraft = useCallback(
    (patch: Partial<DonationDraft>) => dispatch({ type: 'SET_DRAFT', patch }),
    [],
  );
  const resetDraft = useCallback(() => dispatch({ type: 'RESET_DRAFT' }), []);
  const setAllocation = useCallback(
    (allocation: ActiveAllocation | null) => dispatch({ type: 'SET_ALLOCATION', allocation }),
    [],
  );
  const advanceAllocation = useCallback(
    (status: Status) => dispatch({ type: 'ADVANCE_ALLOCATION', status, at: Date.now() }),
    [],
  );
  const addProof = useCallback(
    (status: string, uri: string) => dispatch({ type: 'ADD_PROOF', status, uri, at: Date.now() }),
    [],
  );

  // Arm the "finding a volunteer" simulation for the active request. A nearby
  // volunteer may accept after a random delay; if that delay runs past the wait
  // window, nobody accepts in time and the request auto-cancels with a default
  // reason. Both timers no-op unless the request is still "requested", so
  // whichever fires first wins (and a manual cancel/withdraw cancels both).
  const armWait = useCallback(
    (expiresAt: number) => {
      if (acceptTimer.current) clearTimeout(acceptTimer.current);
      if (cancelTimer.current) clearTimeout(cancelTimer.current);
      const acceptDelay = ACCEPT_MIN_MS + Math.random() * (ACCEPT_MAX_MS - ACCEPT_MIN_MS);
      acceptTimer.current = setTimeout(() => {
        if (stateRef.current.allocation?.current !== 'requested') return;
        dispatch({ type: 'ADVANCE_ALLOCATION', status: 'accepted', at: Date.now() });
        const who = stateRef.current.data.VOLUNTEERS[0]?.name ?? 'A volunteer';
        pushNotification(
          'accepted',
          'Volunteer on the way',
          `${who} accepted your request and is heading to pickup.`,
          ['donor'],
        );
      }, acceptDelay);
      cancelTimer.current = setTimeout(
        () => {
          if (stateRef.current.allocation?.current !== 'requested') return;
          dispatch({ type: 'CANCEL_ALLOCATION', reason: AUTO_CANCEL_REASON, at: Date.now() });
          pushNotification('status', 'Request auto-cancelled', AUTO_CANCEL_REASON, ['donor']);
        },
        Math.max(0, expiresAt - Date.now()),
      );
    },
    [pushNotification],
  );

  // Donor confirms sending a donation to a chosen recipient.
  const confirmSend = useCallback(
    (consumer: Consumer) => {
      setToast(null);
      const cat = state.draft.category;
      const needsVol = state.draft.needsVolunteer !== false;
      const at = Date.now();
      const expiresAt = at + ACCEPT_WINDOW_MS;
      const alloc: ActiveAllocation = {
        category: cat,
        title: state.draft.title || (cat === 'food' ? 'Cooked meal' : 'Clothes bundle'),
        consumer: consumer.name,
        current: 'requested',
        distance: consumer.distance,
        serves: consumer.people,
        needsVolunteer: needsVol,
        createdAt: at,
        expiresAt: needsVol ? expiresAt : undefined,
        timestamps: { requested: at },
      };
      dispatch({ type: 'CLEAR_PROOFS' });
      dispatch({ type: 'SET_ALLOCATION', allocation: alloc });
      dispatch({ type: 'COUNT_DONATION', name: consumer.name, category: cat, monthKey: monthKey() });
      if (needsVol) {
        showToast('Request sent to nearby volunteers', 'success');
        pushNotification(
          'request',
          'New donation to deliver',
          `${alloc.title} for ${consumer.name} — pickup needed.`,
          ['volunteer', 'transport'],
        );
        // Simulate the search for a nearby volunteer (no backend yet). Centralized
        // here so donor-track reflects a single, consistent transition — and so
        // an unanswered request is auto-cancelled instead of waiting forever.
        armWait(expiresAt);
      } else {
        showToast('Recipient notified — arrange handover directly', 'success');
      }
    },
    [state.draft, showToast, pushNotification, armWait],
  );

  // Donor retries a request that was auto-cancelled (no volunteer in time).
  const retryAllocation = useCallback(() => {
    const a = stateRef.current.allocation;
    if (!a) return;
    const at = Date.now();
    const expiresAt = at + ACCEPT_WINDOW_MS;
    dispatch({ type: 'CLEAR_PROOFS' });
    dispatch({ type: 'REARM_ALLOCATION', at, expiresAt });
    showToast('Re-sent to nearby volunteers', 'info');
    pushNotification(
      'request',
      'Donation re-sent',
      `${a.title} for ${a.consumer} — pickup needed.`,
      ['volunteer', 'transport'],
    );
    armWait(expiresAt);
  }, [armWait, showToast, pushNotification]);

  // Donor withdraws the request themselves (clears the pending allocation).
  const withdrawAllocation = useCallback(() => {
    if (acceptTimer.current) clearTimeout(acceptTimer.current);
    if (cancelTimer.current) clearTimeout(cancelTimer.current);
    dispatch({ type: 'SET_ALLOCATION', allocation: null });
  }, []);

  const acceptRequest = useCallback(
    (requestId: string) => {
      dispatch({ type: 'ACCEPT_REQUEST', requestId, at: Date.now() });
      showToast('Accepted — added to your active tasks', 'success');
      const req = stateRef.current.data.OPEN_REQUESTS.find((r) => r.id === requestId);
      const who = stateRef.current.profiles.volunteer.name;
      pushNotification(
        'accepted',
        'Volunteer on the way',
        `${who} accepted ${req?.title ?? 'a delivery'} and is heading to pickup.`,
        ['donor', 'transport'],
      );
    },
    [showToast, pushNotification],
  );
  const setVolTask = useCallback((id: string | null) => dispatch({ type: 'SET_VOL_TASK', id }), []);
  const notifyTaskStatus = useCallback(
    (id: string, status: Status) => {
      const task = stateRef.current.volActive.find((t) => t.id === id);
      const title = task?.title ?? 'Your donation';
      const label = STATUS_LABEL[status] ?? status;
      if (status === 'completed') {
        pushNotification('delivered', 'Delivered', `${title} was delivered and completed. 🎉`, [
          'donor',
          'transport',
        ]);
      } else {
        pushNotification('status', label, `${title} is now ${label.toLowerCase()}.`, ['donor', 'transport']);
      }
    },
    [pushNotification],
  );
  const updateVolTask = useCallback(
    (id: string, patch: Partial<VolunteerTask>) => {
      dispatch({ type: 'UPDATE_VOL_TASK', id, patch, at: patch.current ? Date.now() : undefined });
      if (patch.current) notifyTaskStatus(id, patch.current);
    },
    [notifyTaskStatus],
  );
  const advanceVolTask = useCallback(
    (id: string, status: Status) => {
      dispatch({ type: 'UPDATE_VOL_TASK', id, patch: { current: status }, at: Date.now() });
      notifyTaskStatus(id, status);
    },
    [notifyTaskStatus],
  );

  // Award rewards for a completed delivery. Returns the itemized breakdown so the
  // task screen can show a celebration. Counters, streak, badges, and the ledger
  // are all updated in one pure computation.
  const awardDelivery = useCallback(
    (task: ScoredTask): DeliveryReward => {
      const now = Date.now();
      const prev = stateRef.current.volRewards;
      const { next, reward } = computeDeliveryReward(prev, task, now);
      dispatch({ type: 'SET_VOL_REWARDS', rewards: next });
      pushNotification(
        'reward',
        `+${reward.total} points earned`,
        reward.newBadges.length
          ? `${task.title ?? 'Delivery'} completed · new badge: ${reward.newBadges[0].name} 🎉`
          : `${task.title ?? 'Delivery'} completed. Keep your streak going!`,
        ['volunteer'],
      );
      return reward;
    },
    [pushNotification],
  );

  // Redeem a perk from the rewards store (spends the balance, not lifetime points).
  const redeemPerk = useCallback(
    (perk: Perk): boolean => {
      const now = Date.now();
      const prev = stateRef.current.volRewards;
      const res = applyRedeem(prev, perk, prev.lifetimePoints, now);
      if (!res.ok || !res.next) {
        showToast(res.reason ?? 'Cannot redeem yet', 'error');
        return false;
      }
      dispatch({ type: 'SET_VOL_REWARDS', rewards: res.next });
      showToast(`Redeemed ${perk.name} 🎁`, 'success');
      return true;
    },
    [showToast],
  );

  const addToTeam = useCallback(
    (v: Volunteer) => {
      dispatch({ type: 'ADD_TO_TEAM', volunteer: v });
      showToast(`${v.name} added to your team`, 'success');
    },
    [showToast],
  );
  const addMember = useCallback(
    (v: Volunteer) => {
      dispatch({ type: 'ADD_MEMBER', volunteer: v });
      showToast(`Invite sent to ${v.name}`, 'success');
    },
    [showToast],
  );

  const addConsumer = useCallback(
    (input: NewShelterInput): Consumer => {
      const consumer: Consumer = {
        id: `c-${idSeq.current++}`,
        name: input.name.trim(),
        type: input.type,
        distance: input.distance,
        people: input.people,
        contact: input.contact.trim(),
        address: input.address.trim() || undefined,
        images: input.images,
        notes: input.notes.trim() || undefined,
        addedByUser: true,
        addedAt: Date.now(),
      };
      dispatch({ type: 'ADD_CONSUMER', consumer });
      // Volunteers earn points for putting a new shelter on the map.
      if (stateRef.current.role === 'volunteer') {
        const now = Date.now();
        const prev = stateRef.current.volRewards;
        const nextR: VolRewards = {
          ...prev,
          sheltersRegistered: prev.sheltersRegistered + 1,
          lifetimePoints: prev.lifetimePoints + POINTS.shelter,
          balance: prev.balance + POINTS.shelter,
          ledger: [
            { id: `vr-sh-${now}`, reason: `Registered ${consumer.name}`, delta: POINTS.shelter, at: now, kind: 'earn' },
            ...prev.ledger,
          ],
        };
        nextR.badges = Array.from(new Set([...prev.badges, ...earnedBadgeIds(nextR)]));
        dispatch({ type: 'SET_VOL_REWARDS', rewards: nextR });
        showToast(`${consumer.name} added · +${POINTS.shelter} points`, 'success');
      } else {
        showToast(`${consumer.name} added to recipients`, 'success');
      }
      return consumer;
    },
    [showToast],
  );

  const markNeedUpdated = useCallback(() => dispatch({ type: 'SET_NEED_UPDATED', at: Date.now() }), []);

  const updateDonation = useCallback(
    (id: string, patch: Partial<Donation>) => {
      dispatch({ type: 'UPDATE_DONATION', id, patch });
      showToast('Donation updated', 'success');
      const title = patch.title ?? stateRef.current.data.DONATIONS.find((d) => d.id === id)?.title;
      pushNotification(
        'status',
        'Donation updated',
        `The donor updated ${title ?? 'a donation'} — please review the new details.`,
        ['volunteer', 'transport'],
      );
    },
    [showToast, pushNotification],
  );

  const sendMessage = useCallback((from: string, to: string, text: string) => {
    const body = text.trim();
    if (!body || !from || !to) return;
    const at = Date.now();
    dispatch({
      type: 'SEND_MESSAGE',
      threadId: threadId(from, to),
      message: { id: `msg-${idSeq.current++}`, from, text: body, at },
      reader: from,
      at,
    });
  }, []);

  const markThreadRead = useCallback((me: string, other: string) => {
    if (!me || !other) return;
    dispatch({ type: 'MARK_THREAD_READ', threadId: threadId(me, other), reader: me, at: Date.now() });
  }, []);

  const editMessage = useCallback((me: string, other: string, messageId: string, text: string) => {
    const body = text.trim();
    if (!body) return;
    const tid = threadId(me, other);
    // Only the sender can edit their own message.
    const msg = stateRef.current.threads[tid]?.find((m) => m.id === messageId);
    if (!msg || msg.from !== me) return;
    dispatch({ type: 'EDIT_MESSAGE', threadId: tid, messageId, text: body });
  }, []);

  const setTransportOnline = useCallback(
    (online: boolean) => dispatch({ type: 'SET_TRANSPORT_ONLINE', online }),
    [],
  );
  const addVehicle = useCallback(
    (v: Omit<TransportVehicle, 'id'>) => {
      dispatch({ type: 'ADD_VEHICLE', vehicle: { ...v, id: `tv-${idSeq.current++}` } });
      showToast('Vehicle added', 'success');
    },
    [showToast],
  );
  const updateVehicle = useCallback(
    (id: string, patch: Partial<TransportVehicle>) => dispatch({ type: 'UPDATE_VEHICLE', id, patch }),
    [],
  );
  const removeVehicle = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_VEHICLE', id });
      showToast('Vehicle removed');
    },
    [showToast],
  );
  const submitVerification = useCallback(
    (patch: Partial<TransportVerification>) => {
      dispatch({ type: 'SUBMIT_VERIFICATION', patch });
      showToast('Submitted for verification', 'success');
      // Simulate review + approval (no backend).
      if (verifyTimer.current) clearTimeout(verifyTimer.current);
      verifyTimer.current = setTimeout(() => {
        dispatch({ type: 'SET_VERIFICATION_STATUS', status: 'verified' });
        pushNotification(
          'accepted',
          "You're verified",
          'Your transport account is verified — you can now offer rides.',
          ['transport'],
        );
      }, 2800);
    },
    [showToast, pushNotification],
  );

  const offerTransport = useCallback(
    (jobId: string, vehicleId: string) => {
      const st = stateRef.current;
      const vehicle = st.transportVehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return;
      const provider = st.profiles.transport.name;
      const offer: TransportOffer = {
        id: `to-${idSeq.current++}`,
        jobId,
        provider,
        vehicleType: vehicle.type,
        plate: vehicle.plate,
        pricing: vehicle.pricing,
        fare: vehicle.pricing === 'paid' ? vehicle.fare : undefined,
        contact: st.transportVerification.contact,
        at: Date.now(),
        accepted: false,
      };
      dispatch({ type: 'OFFER_TRANSPORT', offer });
      showToast('Ride offered — volunteers can now pick you', 'success');
      const job = st.data.OPEN_REQUESTS.find((r) => r.id === jobId);
      pushNotification(
        'request',
        'Transport offered a ride',
        `${provider} (${vehicle.type}, ${vehicle.pricing === 'free' ? 'free' : vehicle.fare || 'paid'}) for ${job?.title ?? 'a delivery'}.`,
        ['volunteer', 'donor'],
      );
    },
    [showToast, pushNotification],
  );
  const withdrawTransport = useCallback((jobId: string) => {
    dispatch({
      type: 'WITHDRAW_TRANSPORT',
      jobId,
      provider: stateRef.current.profiles.transport.name,
    });
  }, []);
  const acceptTransportOffer = useCallback(
    (offer: TransportOffer) => {
      const volunteer = stateRef.current.profiles.volunteer.name;
      const transport: Transport = {
        id: `tr-${offer.id}`,
        type: offer.vehicleType,
        plate: offer.plate,
        driver: offer.provider,
        status: 'BUSY',
        pricing: offer.pricing,
        fare: offer.fare,
      };
      dispatch({ type: 'ACCEPT_TRANSPORT_OFFER', offerId: offer.id, volunteer, transport });
      showToast(`${offer.provider} will handle transport`, 'success');
      pushNotification(
        'accepted',
        'Transport confirmed',
        `${volunteer} accepted ${offer.provider}'s ride (${offer.vehicleType}).`,
        ['transport', 'donor'],
      );
    },
    [showToast, pushNotification],
  );

  const assignAllocationVolunteer = useCallback(
    (helper: TaskHelper) => {
      dispatch({ type: 'ASSIGN_ALLOCATION_VOLUNTEER', helper });
      showToast(`${helper.name} added to the delivery team`, 'success');
      const item = stateRef.current.allocation?.title ?? 'a delivery';
      pushNotification('request', 'Added to a delivery', `You were added to help with ${item}.`, [
        'volunteer',
      ]);
    },
    [showToast, pushNotification],
  );
  const removeAllocationVolunteer = useCallback(
    (helperId: string) => dispatch({ type: 'REMOVE_ALLOCATION_VOLUNTEER', helperId }),
    [],
  );
  const addTaskTeammate = useCallback(
    (taskId: string, helper: TaskHelper) => {
      dispatch({ type: 'ADD_TASK_TEAMMATE', taskId, helper });
      showToast(`${helper.name} added to this task`, 'success');
      const task = stateRef.current.volActive.find((t) => t.id === taskId);
      pushNotification(
        'request',
        'Teammate joined the delivery',
        `${helper.name} is now helping with ${task?.title ?? 'a delivery'}.`,
        ['donor'],
      );
    },
    [showToast, pushNotification],
  );
  const removeTaskTeammate = useCallback(
    (taskId: string, helperId: string) => dispatch({ type: 'REMOVE_TASK_TEAMMATE', taskId, helperId }),
    [],
  );

  const updateProfile = useCallback(
    (role: Role, patch: Partial<Profile>) => dispatch({ type: 'UPDATE_PROFILE', role, patch }),
    [],
  );

  const activeTask = useMemo(
    () => state.volActive.find((t) => t.id === state.volTaskId) ?? null,
    [state.volActive, state.volTaskId],
  );

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      toast,
      showToast,
      setRole,
      setPendingRole,
      reset,
      setDraft,
      resetDraft,
      confirmSend,
      retryAllocation,
      withdrawAllocation,
      setAllocation,
      advanceAllocation,
      addProof,
      acceptRequest,
      setVolTask,
      updateVolTask,
      advanceVolTask,
      awardDelivery,
      redeemPerk,
      addToTeam,
      addMember,
      addConsumer,
      updateDonation,
      markNotificationsRead,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      setLanguage,
      setPushEnabled,
      markNeedUpdated,
      sendMessage,
      editMessage,
      markThreadRead,
      setTransportOnline,
      addVehicle,
      updateVehicle,
      removeVehicle,
      submitVerification,
      offerTransport,
      withdrawTransport,
      acceptTransportOffer,
      assignAllocationVolunteer,
      removeAllocationVolunteer,
      addTaskTeammate,
      removeTaskTeammate,
      updateProfile,
      activeTask,
    }),
    [
      state,
      toast,
      showToast,
      setRole,
      setPendingRole,
      reset,
      setDraft,
      resetDraft,
      confirmSend,
      retryAllocation,
      withdrawAllocation,
      setAllocation,
      advanceAllocation,
      addProof,
      acceptRequest,
      setVolTask,
      updateVolTask,
      advanceVolTask,
      awardDelivery,
      redeemPerk,
      addToTeam,
      addMember,
      addConsumer,
      updateDonation,
      markNotificationsRead,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      setLanguage,
      setPushEnabled,
      markNeedUpdated,
      sendMessage,
      editMessage,
      markThreadRead,
      setTransportOnline,
      addVehicle,
      updateVehicle,
      removeVehicle,
      submitVerification,
      offerTransport,
      withdrawTransport,
      acceptTransportOffer,
      assignAllocationVolunteer,
      removeAllocationVolunteer,
      addTaskTeammate,
      removeTaskTeammate,
      updateProfile,
      activeTask,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
