import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.bundlebox.app',
  appName: 'BundleBox',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;
