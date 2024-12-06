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

// Fetch environment variables from Cloudflare Function
async function fetchEnvironmentVariables() {
    try {
        console.log('Fetching environment variables from /env...');
        const response = await fetch('/env');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const envVars = await response.json();
        console.log('Successfully fetched environment variables. Available keys:', Object.keys(envVars).join(', '));
        
        if (Object.keys(envVars).length === 0) {
            throw new Error('No environment variables returned from /env');
        }

        // Set environment variables
        window.__env = {
            ...window.__env,
            ...envVars
        };
        
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
        console.log('Environment variables successfully loaded and verified');
        resolveEnvReady(window.__env);
    } catch (error) {
        console.error('Error fetching environment variables:', error);
        console.log('Current environment:', window.__env);
        rejectEnvReady(error);
    }
}

// Initialize by fetching environment variables
console.log('Starting environment variable fetch...');
fetchEnvironmentVariables();
