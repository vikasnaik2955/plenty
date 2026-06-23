/**
 * Plenty domain models. Mirrors the prototype's sample data shape
 * (`ui_kits/plenty-app/data.js`) but fully typed, so a real API/database can
 * be plugged in behind the repository interface later without touching screens.
 */

export type Role = 'donor' | 'volunteer' | 'consumer' | 'admin' | 'transport';

/** A helper assigned to a delivery task (extra volunteer / teammate). */
export interface TaskHelper {
  id: string;
  name: string;
  contact?: string;
  /** Who added them to the task. */
  addedBy: 'donor' | 'volunteer';
}

/** Transport pricing model — rides can be free or paid (NGO-owned or personal). */
export type Pricing = 'free' | 'paid';

/** One of a transport provider's own vehicles. */
export interface TransportVehicle {
  id: string;
  type: string;
  plate: string;
  pricing: Pricing;
  fare?: string;
  available: boolean;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

/** A transport provider's identity/license verification. */
export interface TransportVerification {
  status: VerificationStatus;
  fullName: string;
  license: string;
  licensePhoto?: string;
  contact: string;
}

/** A ride a transport provider has offered for a delivery job (cross-account). */
export interface TransportOffer {
  id: string;
  /** The delivery job (OpenRequest id = volunteer task id). */
  jobId: string;
  provider: string;
  vehicleType: string;
  plate: string;
  pricing: Pricing;
  fare?: string;
  contact?: string;
  at: number;
  accepted: boolean;
  /** Volunteer who accepted the ride. */
  acceptedBy?: string;
}

export type Category = 'food' | 'clothes';

/** Shared donation lifecycle, used across every role. */
export type Status =
  | 'requested'
  | 'accepted'
  | 'picked_up'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Donor {
  id: string;
  name: string;
  contact: string;
  area: string;
}

export interface Consumer {
  id: string;
  name: string;
  type: string;
  distance: number;
  people: number;
  contact: string;
  /** Street address / locality (added when a donor or volunteer registers one). */
  address?: string;
  /** Location photos of the shelter / community. */
  images?: string[];
  /** Free-text notes for donors (access hours, directions…). */
  notes?: string;
  /** True when added in-app by a donor or volunteer (vs. seed data). */
  addedByUser?: boolean;
  /** Epoch ms when this recipient was registered in-app. */
  addedAt?: number;
}

/** Input collected by the "Add a shelter / community" form. */
export interface NewShelterInput {
  name: string;
  type: string;
  people: number;
  distance: number;
  address: string;
  contact: string;
  images: string[];
  notes: string;
}

export type VolunteerStatus = 'AVAILABLE' | 'BUSY';

export interface Volunteer {
  id: string;
  name: string;
  rating: number;
  distance: number;
  contact: string;
  status: VolunteerStatus;
  trips: number;
}

/** A donor's donation record (active or historical). */
export interface Donation {
  id: string;
  category: Category;
  title: string;
  serves?: number;
  pieces?: string;
  distance: number;
  status: Status;
  consumer: string;
  volunteer: string;
  time: string;
  points?: number;
  /** Optional free-text note the donor added. */
  note?: string;
  /** Transport used for this delivery, if any. */
  transport?: { type: string; driver: string; pricing?: Pricing; fare?: string };
  /** Progress photos for this delivery (with upload times). */
  proofs?: ProofPhotos;
}

/** An open request broadcast to volunteers. */
export interface OpenRequest {
  id: string;
  category: Category;
  title: string;
  donor: string;
  distance: number;
  people: number;
  time: string;
  drop: string;
}

export type NotificationType =
  | 'accepted'
  | 'status'
  | 'reward'
  | 'delivered'
  | 'request';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Legacy display string (seed data); dynamic ones use `at`. */
  time?: string;
  unread: boolean;
  /** Epoch ms the notification was raised. */
  at?: number;
  /** Roles that should see it. Undefined = everyone. */
  audience?: Role[];
}

export interface Transport {
  id: string;
  type: string;
  plate: string;
  driver: string;
  status: VolunteerStatus;
  /** Epoch ms the vehicle was last added / edited / toggled. */
  updatedAt?: number;
  /** Whether this transport is offered free or paid. */
  pricing?: Pricing;
  /** Fare when paid, e.g. "₹150". */
  fare?: string;
}

export interface Allocation {
  id: string;
  item: string;
  consumer: string;
  volunteer: string;
  status: Status;
}

export interface ConsumerIncoming {
  id: string;
  category: Category;
  title: string;
  donor: string;
  status: Status;
  eta: string;
}

export interface ConsumerReceived {
  id: string;
  category: Category;
  title: string;
  donor: string;
  time: string;
}

export interface PlentyData {
  DONORS: Donor[];
  CONSUMERS: Consumer[];
  VOLUNTEERS: Volunteer[];
  DONATIONS: Donation[];
  OPEN_REQUESTS: OpenRequest[];
  NOTIFICATIONS: AppNotification[];
  TRANSPORT: Transport[];
  ALLOCATIONS: Allocation[];
  CONSUMER_INCOMING: ConsumerIncoming[];
  CONSUMER_RECEIVED: ConsumerReceived[];
}

/** Epoch-ms timestamp for each lifecycle stage that has been reached. */
export type StatusTimestamps = Partial<Record<Status, number>>;

/** A progress/evidence photo with the time it was uploaded. */
export interface ProofPhoto {
  uri: string;
  at: number;
}

/** Progress photos keyed by the lifecycle stage they were taken at. */
export type ProofPhotos = Record<string, ProofPhoto>;

/** A donation in progress for the donor's "track" flow. */
export interface ActiveAllocation {
  category: Category;
  title: string;
  consumer: string;
  current: Status;
  distance: number;
  serves?: number;
  pieces?: string;
  needsVolunteer: boolean;
  volunteer?: string;
  /** Extra volunteers the donor assigned to this delivery. */
  team?: TaskHelper[];
  /** Epoch ms when the donation was created. */
  createdAt?: number;
  /**
   * Epoch ms when the request auto-cancels if no volunteer has accepted yet.
   * Set while `current === 'requested'`; drives the waiting countdown.
   */
  expiresAt?: number;
  /** Reason shown when the request was cancelled (auto-timeout or by the donor). */
  cancelReason?: string;
  /** Epoch ms each lifecycle stage was reached. */
  timestamps?: StatusTimestamps;
}

/** A volunteer's accepted task. */
export interface VolunteerTask extends OpenRequest {
  current: Status;
  proofs: ProofPhotos;
  /** Optional transport vehicle the volunteer requested for this delivery. */
  transport?: Transport | null;
  /** Teammates the volunteer pulled in to help with this task. */
  team?: TaskHelper[];
  /** Epoch ms each lifecycle stage was reached (accepted, picked_up, …). */
  timestamps?: StatusTimestamps;
}

export interface Profile {
  name: string;
  photo: string | null;
  sub: string;
}

/** A saved pickup/delivery address in the user's profile. */
export interface SavedAddress {
  id: string;
  /** Short label: Home, Work, or a custom name. */
  label: string;
  address: string;
  isDefault?: boolean;
}

/** A row in the volunteer's points history ledger. */
export interface VolLedgerEntry {
  id: string;
  reason: string;
  /** Signed points change (positive earned, negative redeemed). */
  delta: number;
  at: number;
  kind: 'earn' | 'bonus' | 'redeem';
}

/**
 * The volunteer's rewards state. `lifetimePoints` only ever grows and drives the
 * tier + point-threshold badges; `balance` is the spendable wallet that perks
 * deduct from — so redeeming a perk never demotes the volunteer's tier.
 */
export interface VolRewards {
  lifetimePoints: number;
  balance: number;
  // Counters that badges and stats read.
  deliveriesCompleted: number;
  peopleFed: number;
  onTimePickups: number;
  fullyDocumentedRuns: number;
  totalDistanceKm: number;
  foodDeliveries: number;
  teammateRuns: number;
  sheltersRegistered: number;
  monsoonDeliveries: number;
  // Weekly streak machinery.
  deliveriesThisWeek: number;
  currentWeekKey: number;
  lastQualifiedWeekKey: number | null;
  weeklyStreak: number;
  longestWeeklyStreak: number;
  /** Quarter key the once-per-quarter grace week was used in (null = unused). */
  graceQuarterUsed: string | null;
  /** Streak milestones already paid out (e.g. [4, 12]). */
  milestonesAwarded: number[];
  /** Unlocked badge ids. */
  badges: string[];
  /** Redeemed perks (id + time). */
  redeemed: { id: string; at: number }[];
  /** Points history, newest first. */
  ledger: VolLedgerEntry[];
}

/** A chat message within a conversation thread between two named participants. */
export interface ChatMessage {
  id: string;
  /** Sender's display name. */
  from: string;
  text: string;
  at: number;
  /** True once the sender has edited it (messages can be edited, not deleted). */
  edited?: boolean;
}
