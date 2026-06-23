/**
 * Plenty — sample in-memory data, ported verbatim from the prototype's
 * `ui_kits/plenty-app/data.js`. No backend; this is the seed the MockRepository
 * serves. Swap for an ApiRepository later (see repository.ts).
 */
import type { PlentyData } from './types';

// Stamp seed progress photos relative to now so their times read sensibly.
const NOW = Date.now();
const HOUR = 60 * 60 * 1000;

export const MOCK_DATA: PlentyData = {
  DONORS: [{ id: 'do1', name: 'Asha Verma', contact: '+91 98201 04412', area: 'Bandra West' }],

  CONSUMERS: [
    { id: 'c1', name: 'Hope Shelter', type: 'Community shelter', distance: 2.4, people: 40, contact: '+91 98990 11020' },
    { id: 'c2', name: 'Asha Sadan NGO', type: 'NGO', distance: 5.1, people: 18, contact: '+91 98990 22456' },
    { id: 'c3', name: 'Seva Kitchen', type: 'Community kitchen', distance: 6.8, people: 65, contact: '+91 98990 33871' },
    { id: 'c4', name: 'Little Stars Home', type: "Children's home", distance: 8.9, people: 24, contact: '+91 98990 44990' },
  ],

  VOLUNTEERS: [
    { id: 'v1', name: 'Ravi Kumar', rating: 4.9, distance: 1.2, contact: '+91 98111 22010', status: 'AVAILABLE', trips: 132 },
    { id: 'v2', name: 'Meera Nair', rating: 4.8, distance: 2.0, contact: '+91 98111 33422', status: 'AVAILABLE', trips: 98 },
    { id: 'v3', name: 'Sofia Khan', rating: 5.0, distance: 3.4, contact: '+91 98111 55890', status: 'BUSY', trips: 211 },
    { id: 'v4', name: 'Daniel Joseph', rating: 4.7, distance: 4.1, contact: '+91 98111 77341', status: 'AVAILABLE', trips: 54 },
  ],

  DONATIONS: [
    { id: 'al1', category: 'food', title: 'Veg biryani', serves: 12, distance: 2.4, status: 'picked_up', consumer: 'Hope Shelter', volunteer: 'Ravi Kumar', time: 'Today, 4:02 PM', note: 'Freshly cooked, mildly spiced.', transport: { type: 'Auto rickshaw', driver: 'Salim Shaikh', pricing: 'free' } },
    { id: 'al2', category: 'clothes', title: 'Winter jackets', pieces: '3 bags', distance: 5.1, status: 'completed', consumer: 'Asha Sadan NGO', volunteer: 'Meera Nair', time: 'Yesterday', points: 60, proofs: {
      picked_up: { uri: 'https://picsum.photos/seed/plentypickup/400/400', at: NOW - 26 * HOUR },
      delivered: { uri: 'https://picsum.photos/seed/plentydeliver/400/400', at: NOW - 25 * HOUR },
      completed: { uri: 'https://picsum.photos/seed/plentydone/400/400', at: NOW - 25 * HOUR + 10 * 60 * 1000 },
    } },
    { id: 'al3', category: 'food', title: 'Packaged rice & dal', serves: 30, distance: 6.8, status: 'completed', consumer: 'Seva Kitchen', volunteer: 'Sofia Khan', time: '2 days ago', points: 90 },
    { id: 'al4', category: 'clothes', title: "Kids' clothing", pieces: '20 pieces', distance: 8.9, status: 'cancelled', consumer: 'Little Stars Home', volunteer: '—', time: '4 days ago' },
  ],

  OPEN_REQUESTS: [
    { id: 'r1', category: 'food', title: 'Veg biryani · serves 12', donor: 'Asha V.', distance: 1.8, people: 12, time: 'Pickup before 8 PM', drop: 'Hope Shelter' },
    { id: 'r2', category: 'clothes', title: 'Blankets · 2 bags', donor: 'Imran S.', distance: 2.6, people: 30, time: 'Pickup before 9 PM', drop: 'Seva Kitchen' },
    { id: 'r3', category: 'food', title: 'Sandwiches · serves 20', donor: 'Neha P.', distance: 3.9, people: 20, time: 'Pickup before 7 PM', drop: 'Asha Sadan NGO' },
  ],

  NOTIFICATIONS: [
    { id: 'n1', type: 'accepted', title: 'Volunteer on the way', message: 'Ravi accepted your donation and is heading to pickup.', time: '2m', unread: true },
    { id: 'n2', type: 'status', title: 'Picked up', message: 'Your veg biryani is on its way to Hope Shelter.', time: '18m', unread: true },
    { id: 'n3', type: 'reward', title: '+60 points earned', message: 'Winter jackets delivered to Asha Sadan NGO.', time: '1d', unread: false },
    { id: 'n4', type: 'delivered', title: 'Delivered', message: 'Packaged rice & dal reached Seva Kitchen.', time: '2d', unread: false },
  ],

  TRANSPORT: [
    { id: 't1', type: 'Two-wheeler', plate: 'MH 02 AB 1123', driver: 'Ravi Kumar', status: 'BUSY', pricing: 'free' },
    { id: 't2', type: 'Cargo van', plate: 'MH 02 CD 4490', driver: 'Meera Nair', status: 'AVAILABLE', pricing: 'paid', fare: '₹150' },
    { id: 't3', type: 'Auto rickshaw', plate: 'MH 02 EF 7781', driver: 'Salim Shaikh', status: 'AVAILABLE', pricing: 'free' },
  ],

  ALLOCATIONS: [
    { id: 'al1', item: 'Veg biryani', consumer: 'Hope Shelter', volunteer: 'Ravi Kumar', status: 'picked_up' },
    { id: 'al5', item: 'Blankets', consumer: 'Seva Kitchen', volunteer: 'Meera Nair', status: 'accepted' },
    { id: 'al2', item: 'Winter jackets', consumer: 'Asha Sadan NGO', volunteer: 'Meera Nair', status: 'completed' },
    { id: 'al6', item: 'Bread & milk', consumer: 'Little Stars Home', volunteer: '—', status: 'requested' },
  ],

  CONSUMER_INCOMING: [
    { id: 'i1', category: 'food', title: 'Veg biryani · serves 12', donor: 'Asha V.', status: 'picked_up', eta: 'ETA 15 min' },
    { id: 'i2', category: 'clothes', title: 'Blankets · 2 bags', donor: 'Imran S.', status: 'accepted', eta: 'ETA 40 min' },
  ],

  CONSUMER_RECEIVED: [
    { id: 'rc1', category: 'food', title: 'Packaged rice & dal', donor: 'Neha P.', time: '2 days ago' },
    { id: 'rc2', category: 'clothes', title: 'School uniforms', donor: 'Rotary Club', time: '5 days ago' },
  ],
};

export const INITIAL_PROFILES = {
  donor: { name: 'Asha Verma', photo: null, sub: 'Bandra West' },
  volunteer: { name: 'Ravi Kumar', photo: null, sub: '132 trips · Bandra' },
  consumer: { name: 'Hope Shelter', photo: null, sub: 'Community shelter' },
  admin: { name: 'Plenty Ops', photo: null, sub: 'Operations team' },
  transport: { name: 'Salim Shaikh', photo: null, sub: 'Auto rickshaw · Bandra' },
} as const;
