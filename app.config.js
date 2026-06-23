/**
 * Dynamic Expo config.
 *
 * Keeps the Google Maps API key OUT of source control. Expo reads `app.json`
 * first and passes it here as `config`; we overlay the key, read from the
 * `GOOGLE_MAPS_API_KEY` environment variable (loaded from a local, gitignored
 * `.env` file — copy `.env.example` to `.env` and paste your key).
 *
 * The key is still embedded in the built app (the native Google Maps SDK and
 * `Constants.expoConfig.extra` both need it at runtime) — that's expected. The
 * point is that the secret lives in your environment, not in the committed
 * repo. Protect it by restricting the key in the Google Cloud Console (Android
 * package name + SHA-1, and the specific Maps SDKs), not by hiding it.
 *
 * @param {{ config: import('@expo/config-types').ExpoConfig }} ctx
 */
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
    extra: {
      ...config.extra,
      googleMapsApiKey,
    },
  };
};
