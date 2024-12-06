// Initialize environment configuration only if not already initialized
if (!window.__envInitialized) {
    window.__envInitialized = true;
    window.__env = window.__env || {};

    // Create a promise that resolves when config is ready
    let resolveEnvReady, rejectEnvReady;
    if (!window.__envReady) {
        window.__envReady = new Promise((resolve, reject) => {
            resolveEnvReady = resolve;
            rejectEnvReady = reject;
        });
    }
    export const envReady = window.__envReady;  // Export the same promise

    // Get an environment variable
    export function getEnvVar(key) {
        if (!window.__env) {
            throw new Error('Environment variables not initialized');
        }
        const value = window.__env[key];
        if (!value) {
            console.warn(`Environment variable ${key} not found`);
        }
        return value || null;
    }

    // Fetch environment variables from Cloudflare Function
    async function fetchEnvironmentVariables() {
        try {
            console.log('env-config.js: Fetching environment variables from /functions/env...');
            const response = await fetch('/functions/env');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const envVars = await response.json();
            console.log('env-config.js: Successfully fetched environment variables. Available keys:', Object.keys(envVars).join(', '));
            
            // Log the actual values for debugging
            console.log('env-config.js: Raw environment variable values:', envVars);
            
            if (Object.keys(envVars).length === 0) {
                throw new Error('No environment variables returned from /functions/env');
            }

            // Set environment variables
            window.__env = {
                ...window.__env,
                ...envVars
            };

            // Log the current state of window.__env
            console.log('env-config.js: window.__env values:', {
                ...window.__env,
                // Redact sensitive values
                FIREBASE_API_KEY: window.__env.FIREBASE_API_KEY ? '[SET]' : '[NOT SET]',
                FIREBASE_AUTH_DOMAIN: window.__env.FIREBASE_AUTH_DOMAIN ? '[SET]' : '[NOT SET]',
                FIREBASE_PROJECT_ID: window.__env.FIREBASE_PROJECT_ID ? '[SET]' : '[NOT SET]',
                FIREBASE_STORAGE_BUCKET: window.__env.FIREBASE_STORAGE_BUCKET ? '[SET]' : '[NOT SET]',
                FIREBASE_MESSAGING_SENDER_ID: window.__env.FIREBASE_MESSAGING_SENDER_ID ? '[SET]' : '[NOT SET]',
                FIREBASE_APP_ID: window.__env.FIREBASE_APP_ID ? '[SET]' : '[NOT SET]',
                FIREBASE_MEASUREMENT_ID: window.__env.FIREBASE_MEASUREMENT_ID ? '[SET]' : '[NOT SET]'
            });

            // Resolve the ready promise
            resolveEnvReady();
        } catch (error) {
            console.error('env-config.js: Error fetching environment variables:', error);
            console.log('env-config.js: Current environment:', window.__env);
            rejectEnvReady(error);
        }
    }

    // Initialize by fetching environment variables
    console.log('env-config.js: Starting environment variable fetch...');
    fetchEnvironmentVariables();
} else {
    console.log('env-config.js: Environment already initialized');
    export const envReady = window.__envReady;
}
