import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.justachat.app',
  appName: 'Justachat',
  webDir: 'dist',
  server: {
    url: 'https://justachat.net',
    cleartext: true
  },
  // Enable deep linking for OAuth callbacks
  plugins: {
    Browser: {
      // Browser plugin will handle OAuth redirects
    }
  },
  // App Links / Universal Links for OAuth callback
  android: {
    allowMixedContent: true
  }
};

export default config;
