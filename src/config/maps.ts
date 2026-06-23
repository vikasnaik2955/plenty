/**
 * Google Maps key access. Paste your key in `app.json` (android.config.googleMaps.apiKey,
 * ios.config.googleMapsApiKey, and extra.googleMapsApiKey) — see the README/notes.
 * The embedded map only renders in a development build; `hasMapsKey` lets the UI
 * fall back to the static map + "Open in Google Maps" when the key isn't set or
 * when running in Expo Go.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';

const PLACEHOLDER = 'REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY';

const extra = (Constants.expoConfig?.extra ?? {}) as { googleMapsApiKey?: string };

export const GOOGLE_MAPS_API_KEY = extra.googleMapsApiKey ?? '';

/** True when a real key has been configured (not the placeholder). */
export const hasMapsKey =
  GOOGLE_MAPS_API_KEY.length > 0 && GOOGLE_MAPS_API_KEY !== PLACEHOLDER;

/**
 * Expo Go ('storeClient') doesn't include the native maps module, so the
 * embedded MapView renders blank there. Only use the native map in a dev/standalone
 * build with a key; otherwise the UI shows the static map fallback.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const canUseNativeMaps = hasMapsKey && !isExpoGo;
