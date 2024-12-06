// Import Firebase modules
import { getRemoteConfig } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";
import { getValue as getFirebaseValue } from './firebase-config.js';

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
    }

    async initialize() {
        // No need to initialize here as it's handled in firebase-config.js
        return true;
    }

    getString(key) {
        return getFirebaseValue(key) || this.remoteConfig.defaultConfig[key];
    }

    getBoolean(key) {
        const value = getFirebaseValue(key);
        if (value === null) return this.remoteConfig.defaultConfig[key];
        return value.toLowerCase() === 'true';
    }

    getNumber(key) {
        const value = getFirebaseValue(key);
        if (value === null) return this.remoteConfig.defaultConfig[key];
        return Number(value);
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

    getContactEmail() {
        return this.getString('contact_email');
    }

    isPrayerRequestEnabled() {
        return this.getBoolean('prayer_request_enabled');
    }

    isLivestreamEnabled() {
        return this.getBoolean('livestream_enabled');
    }
}

export { ConfigService };
