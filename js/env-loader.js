// Default development configuration
window.__env = {
    FIREBASE_API_KEY: 'your_firebase_api_key_here',
    FIREBASE_AUTH_DOMAIN: 'your_project_id.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'your_project_id',
    FIREBASE_STORAGE_BUCKET: 'your_project_id.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: 'your_sender_id',
    FIREBASE_APP_ID: 'your_app_id',
    FIREBASE_MEASUREMENT_ID: 'your_measurement_id',
    YOUTUBE_API_KEY: 'your_youtube_api_key_here'
};

// Function to load external config
async function loadExternalConfig() {
    try {
        const response = await fetch('/config.external.js');
        if (!response.ok) throw new Error('Failed to load external config');
        
        const text = await response.text();
        // Safely evaluate the config file
        const configFunc = new Function('window', text);
        const tempWindow = {};
        configFunc(tempWindow);
        
        if (tempWindow.__remoteConfig) {
            // Map the remote config to our env format
            if (tempWindow.__remoteConfig.youtube_api_key) {
                window.__env.YOUTUBE_API_KEY = tempWindow.__remoteConfig.youtube_api_key;
            }
        }
    } catch (error) {
        console.warn('Failed to load external config:', error);
        // Continue with default config
    }
}

// Load environment variables from .env file for local development
async function loadEnvFile() {
    try {
        const response = await fetch('/.env');
        if (!response.ok) throw new Error('Failed to load .env file');
        
        const text = await response.text();
        const env = {};
        text.split('\n').forEach(line => {
            const match = line.match(/^([^#\s][^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim();
            }
        });
        Object.assign(window.__env, env);
    } catch (error) {
        console.warn('Error loading .env file:', error);
        // Continue with existing config
    }
}

// Initialize configuration immediately
window.__env = window.__env || {};

// Load all configurations
Promise.all([loadExternalConfig(), loadEnvFile()])
    .catch(error => {
        console.error('Error loading configurations:', error);
    });
