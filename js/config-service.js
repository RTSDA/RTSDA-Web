// Import Firebase modules
import { getRemoteConfig, fetchAndActivate, getValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";

class ConfigService {
    constructor() {
        this.remoteConfig = getRemoteConfig();
        // Set default values
        this.remoteConfig.defaultConfig = {
            website_title: 'RTSDA',
            website_description: 'Real Time Strategy Development Association',
            website_enabled: true,
            contact_email: 'contact@rtsda.org',
            prayer_request_enabled: true,
            livestream_enabled: true
        };
        
        // Set fetch timeout and minimum fetch interval
        this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
        this.remoteConfig.settings.fetchTimeoutMillis = 60000; // 1 minute
    }

    async initialize() {
        try {
            const activated = await fetchAndActivate(this.remoteConfig);
            console.log('Remote config fetched and activated:', activated);
            return activated;
        } catch (error) {
            console.error('Error fetching remote config:', error);
            return false;
        }
    }

    getString(key) {
        return getValue(this.remoteConfig, key).asString();
    }

    getBoolean(key) {
        return getValue(this.remoteConfig, key).asBoolean();
    }

    getNumber(key) {
        return getValue(this.remoteConfig, key).asNumber();
    }

    // Helper methods for specific configurations
    getWebsiteTitle() {
        return this.getString('website_title');
    }

    getWebsiteDescription() {
        return this.getString('website_description');
    }

    isWebsiteEnabled() {
        return this.getBoolean('website_enabled');
    }

    isPrayerRequestEnabled() {
        return this.getBoolean('prayer_request_enabled');
    }

    isLivestreamEnabled() {
        return this.getBoolean('livestream_enabled');
    }

    getContactEmail() {
        return this.getString('contact_email');
    }
}

export { ConfigService };
