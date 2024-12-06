// Initialize environment configuration
window.__env = window.ENV || {};

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

// Initialize immediately
resolveEnvReady(window.__env);
