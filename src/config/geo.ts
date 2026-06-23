/**
 * Approximate coordinates for the prototype's people/places (Bandra, Mumbai).
 * Until a real backend supplies geolocation, we look points up by name and fall
 * back to a deterministic jitter near the base location so the map always has
 * sensible markers.
 */
import type { Geo } from '@/utils/contact';

/** Donor home / city center (Bandra West). */
export const BASE: Geo = { lat: 19.0596, lng: 72.8295 };

const PLACES: Record<string, Geo> = {
  // Donor
  'Asha Verma': { lat: 19.0606, lng: 72.8365 },
  'Asha V.': { lat: 19.0606, lng: 72.8365 },
  // Consumers / recipients
  'Hope Shelter': { lat: 19.0512, lng: 72.8201 },
  'Asha Sadan NGO': { lat: 19.0728, lng: 72.8412 },
  'Seva Kitchen': { lat: 19.0419, lng: 72.8554 },
  'Little Stars Home': { lat: 19.0805, lng: 72.8666 },
  // Volunteers
  'Ravi Kumar': { lat: 19.0563, lng: 72.832 },
  'Meera Nair': { lat: 19.0648, lng: 72.8248 },
  'Sofia Khan': { lat: 19.0481, lng: 72.8389 },
  'Daniel Joseph': { lat: 19.0712, lng: 72.8302 },
};

/** Deterministic small offset from a string, so unknown names get a stable spot. */
function jitter(seed: string): Geo {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const dx = ((h % 1000) / 1000 - 0.5) * 0.03;
  const dy = (((h >> 10) % 1000) / 1000 - 0.5) * 0.03;
  return { lat: BASE.lat + dy, lng: BASE.lng + dx };
}

/** Coordinates for a named person/place, with a stable fallback near BASE. */
export function geoForName(name?: string): Geo {
  if (!name) return BASE;
  return PLACES[name] ?? jitter(name);
}
