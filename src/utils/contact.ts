/**
 * Contact + navigation helpers. Calls open the phone dialer; directions open
 * the Google Maps app (falls back to the browser). These work everywhere,
 * including Expo Go.
 */
import { Linking } from 'react-native';

export interface Geo {
  lat: number;
  lng: number;
}

/** Open the phone dialer for a number. */
export function callNumber(phone?: string) {
  if (!phone) return;
  const num = phone.replace(/[^+\d]/g, '');
  if (!num) return;
  Linking.openURL(`tel:${num}`).catch(() => {});
}

function destParam(dest: Geo | string): string {
  return typeof dest === 'string' ? encodeURIComponent(dest) : `${dest.lat},${dest.lng}`;
}

/** Open turn-by-turn directions in the Google Maps app. */
export function openDirections(dest: Geo | string, origin?: Geo) {
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destParam(dest)}&travelmode=driving`;
  if (origin) url += `&origin=${origin.lat},${origin.lng}`;
  Linking.openURL(url).catch(() => {});
}

/** Open a place / pin in the Google Maps app. */
export function openPlace(dest: Geo | string) {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destParam(dest)}`).catch(
    () => {},
  );
}
