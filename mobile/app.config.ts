import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'AEGIS ClaimOS',
  slug: 'aegis-claimos',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'aegisclaimos',
  userInterfaceStyle: 'light',
  splash: { image: './assets/images/splash-icon.png', resizeMode: 'contain', backgroundColor: '#10233D' },
  ios: { supportsTablet: true, bundleIdentifier: 'com.jceelabs.aegisclaimos' },
  android: {
    package: 'com.jceelabs.aegisclaimos',
    adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: '#10233D' },
  },
  web: { bundler: 'metro', output: 'static', favicon: './assets/images/favicon.png' },
  plugins: ['expo-router', 'expo-image-picker'],
  experiments: { typedRoutes: true },
};

export default config;
