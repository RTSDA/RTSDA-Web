// Function to get environment variables
let configCache = null;

function getConfig() {
    if (configCache) return configCache;
    
    try {
        // Try window.__env first (set by env-loader.js)
        if (typeof window !== 'undefined' && window.__env) {
            configCache = window.__env;
            return window.__env;
        }
        
        // Try process.env for Node.js environment
        if (typeof process !== 'undefined' && process.env) {
            const envVars = {};
            const requiredKeys = [
                'FIREBASE_API_KEY',
                'FIREBASE_AUTH_DOMAIN',
                'FIREBASE_PROJECT_ID',
                'FIREBASE_STORAGE_BUCKET',
                'FIREBASE_MESSAGING_SENDER_ID',
                'FIREBASE_APP_ID',
                'FIREBASE_MEASUREMENT_ID',
                'YOUTUBE_API_KEY',
                'GOOGLE_MAPS_API_KEY'
            ];
            
            requiredKeys.forEach(key => {
                if (process.env[key]) {
                    envVars[key] = process.env[key];
                }
            });
            
            if (Object.keys(envVars).length > 0) {
                configCache = envVars;
                return envVars;
            }
        }
        
        // Try Cloudflare Pages environment
        if (typeof _env !== 'undefined') {
            configCache = _env;
            return _env;
        }

        // Use default configuration if nothing else is available
        if (window.__env) {
            configCache = window.__env;
            return window.__env;
        }

        throw new Error('No environment configuration found. Please ensure environment variables are properly set and env-loader.js is loaded before other scripts.');
    } catch (error) {
        console.error('Error accessing config:', error);
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
