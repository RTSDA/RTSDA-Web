import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { app } from '@/config/firebase';

class SermonAuthService {
  private static instance: SermonAuthService;
  private token: string | null = null;
  private remoteConfig: ReturnType<typeof getRemoteConfig> | null = null;

  private constructor() {
    // Initialize Firebase Remote Config
    if (typeof window !== 'undefined') { // Only initialize on client-side
      const remoteConfig = getRemoteConfig(app);
      remoteConfig.settings = {
        minimumFetchIntervalMillis: process.env.NODE_ENV === 'development' ? 0 : 43200000, // 12 hours
        fetchTimeoutMillis: 60000, // 1 minute timeout
      };
      remoteConfig.defaultConfig = {
        'sermon_key': 'ThyWordisaLamp=4890'
      };
      this.remoteConfig = remoteConfig;
    }
  }

  public static getInstance(): SermonAuthService {
    if (!SermonAuthService.instance) {
      SermonAuthService.instance = new SermonAuthService();
    }
    return SermonAuthService.instance;
  }

  private async fetchKey(): Promise<void> {
    try {
      // If we're on the server-side, return the default key
      if (typeof window === 'undefined') {
        this.token = 'ThyWordisaLamp=4890';
        return;
      }

      if (!this.remoteConfig) {
        console.error('Remote config not initialized');
        return;
      }

      await fetchAndActivate(this.remoteConfig);
      this.token = getValue(this.remoteConfig, 'sermon_key').asString();
      console.log('🔑 Fetched key:', this.token);
    } catch (error) {
      console.error('❌ Error fetching key:', error);
      // Fallback to default key if there's an error
      this.token = 'ThyWordisaLamp=4890';
    }
  }

  public async waitForToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    // If no token, try fetching it
    await this.fetchKey();

    // Check again after fetch
    if (this.token) {
      return this.token;
    }

    throw new Error('Failed to get authentication token');
  }
}

export const sermonAuthService = SermonAuthService.getInstance();
