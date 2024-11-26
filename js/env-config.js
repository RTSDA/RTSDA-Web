// Function to get environment variables
let configCache = null;

function getConfig() {
    if (configCache) return configCache;
    
    try {
        // Try window.__env first (set by env-loader.js)
        if (typeof window !== 'undefined' && window.__env) {
            // Log environment status
            console.log('Environment variables status:', Object.keys(window.__env).reduce((acc, key) => {
                acc[key] = !!window.__env[key];
                return acc;
            }, {}));

            // Verify that we have the required Firebase configuration
            const requiredKeys = [
                'FIREBASE_API_KEY',
                'FIREBASE_AUTH_DOMAIN',
                'FIREBASE_PROJECT_ID',
                'FIREBASE_STORAGE_BUCKET',
                'FIREBASE_MESSAGING_SENDER_ID',
                'FIREBASE_APP_ID'
            ];

            const missingKeys = requiredKeys.filter(key => !window.__env[key]);
            if (missingKeys.length > 0) {
                console.error('Missing required environment variables:', missingKeys);
                throw new Error('Missing required environment variables: ' + missingKeys.join(', '));
            }

            configCache = window.__env;
            return window.__env;
        }
        
        console.error('No environment configuration found');
        throw new Error('No environment configuration found');
    } catch (error) {
        console.error('Error loading environment configuration:', error);
        throw error;
    }
}

export function getEnvVar(key) {
    try {
        const config = getConfig();
        return config[key] || null;
    } catch (error) {
        console.error(`Error getting environment variable ${key}:`, error);
        return null;
    }
}

export function getFirebaseConfig() {
    const config = getConfig();
    
    // Verify that all required config values are present
    const requiredKeys = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID',
        'FIREBASE_MEASUREMENT_ID'
    ];

    const missingKeys = requiredKeys.filter(key => !config[key]);
    
    if (missingKeys.length > 0) {
        throw new Error(`Missing required Firebase configuration keys: ${missingKeys.join(', ')}`);
    }

    return {
        apiKey: config.FIREBASE_API_KEY,
        authDomain: config.FIREBASE_AUTH_DOMAIN,
        projectId: config.FIREBASE_PROJECT_ID,
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
        appId: config.FIREBASE_APP_ID,
        measurementId: config.FIREBASE_MEASUREMENT_ID
    };
}
