import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.bundlebox.app',
  appName: 'BundleBox',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
