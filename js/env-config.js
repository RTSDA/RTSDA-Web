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
            console.log('env-config.js: Fetching environment variables from /env...');
            const response = await fetch('/env');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const envVars = await response.json();
            console.log('env-config.js: Successfully fetched environment variables. Available keys:', Object.keys(envVars).join(', '));
            
            // Log the actual values for debugging
            console.log('env-config.js: Raw environment variable values:', envVars);
            
            if (Object.keys(envVars).length === 0) {
                throw new Error('No environment variables returned from /env');
            }

            // Set environment variables
            window.__env = {
                ...window.__env,
                ...envVars
            };
            
            // Log the window.__env values
            console.log('env-config.js: window.__env values:', Object.fromEntries(
                Object.entries(window.__env).map(([key, value]) => [key, value ? '[SET]' : '[EMPTY]'])
            ));
            
            // Verify that all required variables are set
            const requiredVars = [
                'FIREBASE_API_KEY',
                'FIREBASE_AUTH_DOMAIN',
                'FIREBASE_PROJECT_ID',
                'FIREBASE_STORAGE_BUCKET',
                'FIREBASE_MESSAGING_SENDER_ID',
                'FIREBASE_APP_ID'
            ];
            
            const missingVars = requiredVars.filter(key => !window.__env[key]);
            if (missingVars.length > 0) {
                throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
            }
            
            // Only resolve if all required variables are present
            console.log('env-config.js: Environment variables successfully loaded and verified');
            resolveEnvReady(window.__env);
        } catch (error) {
            console.error('env-config.js: Error fetching environment variables:', error);
            console.log('env-config.js: Current environment:', Object.keys(window.__env || {}).join(', '));
            rejectEnvReady(error);
        }
    }

    // Initialize by fetching environment variables
    console.log('env-config.js: Starting environment variable fetch...');
    fetchEnvironmentVariables();
} else {
    console.log('env-config.js: Environment already initialized, skipping...');
    export const envReady = window.__envReady;
}
