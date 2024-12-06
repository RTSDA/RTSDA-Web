// Initialize environment configuration
window.__env = window.__env || {};

// Create a promise that resolves when config is ready
let resolveEnvReady, rejectEnvReady;
export const envReady = new Promise((resolve, reject) => {
    resolveEnvReady = resolve;
    rejectEnvReady = reject;
});

// Get an environment variable
export function getEnvVar(key) {
    return window.__env[key] || null;
}

// Get Firebase configuration
export function getFirebaseConfig() {
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
        const error = new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
        console.error(error);
        console.log('Current environment variables:', Object.keys(window.__env));
        throw error;
    }

    return {
        apiKey: window.__env.FIREBASE_API_KEY,
        authDomain: window.__env.FIREBASE_AUTH_DOMAIN,
        projectId: window.__env.FIREBASE_PROJECT_ID,
        storageBucket: window.__env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: window.__env.FIREBASE_MESSAGING_SENDER_ID,
        appId: window.__env.FIREBASE_APP_ID,
        measurementId: window.__env.FIREBASE_MEASUREMENT_ID
    };
}

// Fetch environment variables from Cloudflare Function
async function fetchEnvironmentVariables() {
    try {
        console.log('Fetching environment variables from functions/env...');
        const response = await fetch('/functions/env');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const envVars = await response.json();
        console.log('Successfully fetched environment variables. Available keys:', Object.keys(envVars).join(', '));
        
        if (Object.keys(envVars).length === 0) {
            throw new Error('No environment variables returned from /functions/env');
        }
        
        // Update window.__env with fetched variables
        Object.assign(window.__env, envVars);
        
        // Try to validate Firebase config
        try {
            getFirebaseConfig();
            console.log('Firebase configuration validated successfully');
            resolveEnvReady(window.__env);
        } catch (error) {
            console.error('Firebase configuration validation failed:', error.message);
            rejectEnvReady(error);
        }
    } catch (error) {
        console.error('Error fetching environment variables:', error);
        console.log('Current environment:', window.__env);
        rejectEnvReady(error);
    }
}

// Initialize by fetching environment variables
console.log('Starting environment variable fetch...');
fetchEnvironmentVariables();
