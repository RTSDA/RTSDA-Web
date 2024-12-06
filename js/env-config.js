// Initialize environment configuration
window.__env = window.__env || {};

// Create a promise that resolves when config is ready
let resolveEnvReady;
export const envReady = new Promise(resolve => {
    resolveEnvReady = resolve;
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
        throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
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

// Fetch environment variables from Cloudflare Pages
async function fetchEnvironmentVariables() {
    try {
        console.log('Fetching environment variables from /env...');
        const response = await fetch('/env');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const envVars = await response.json();
        console.log('Successfully fetched environment variables. Available keys:', Object.keys(envVars).join(', '));
        
        // Update window.__env with fetched variables
        Object.assign(window.__env, envVars);
        
        // Resolve the envReady promise
        resolveEnvReady(window.__env);
    } catch (error) {
        console.error('Error fetching environment variables:', error);
        // If fetch fails, try to proceed with any variables we might have from config.js
        resolveEnvReady(window.__env);
    }
}

// Initialize by fetching environment variables
fetchEnvironmentVariables();
