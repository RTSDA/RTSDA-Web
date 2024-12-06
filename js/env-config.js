// Create a promise that resolves when config is ready
let resolveEnvReady, rejectEnvReady;
const envReadyPromise = new Promise((resolve, reject) => {
    resolveEnvReady = resolve;
    rejectEnvReady = reject;
});

export const envReady = envReadyPromise;

// Environment variables storage
const envVars = {};

// Get an environment variable
export function getEnvVar(key) {
    if (!envVars) {
        throw new Error('Environment variables not initialized');
    }
    const value = envVars[key];
    if (value === undefined) {
        console.warn(`Environment variable ${key} not found`);
    }
    return value;
}

// Fetch environment variables from Cloudflare Function
async function fetchEnvironmentVariables() {
    try {
        console.log('env-config.js: Fetching environment variables...');
        const response = await fetch('/functions/env');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('env-config.js: Environment variables fetched successfully');
        
        // Store variables
        Object.assign(envVars, data);
        
        // Resolve the promise
        resolveEnvReady();
        
        return data;
    } catch (error) {
        console.error('env-config.js: Error fetching environment variables:', error);
        rejectEnvReady(error);
        throw error;
    }
}

// Initialize by fetching environment variables
console.log('env-config.js: Starting environment variable fetch...');
fetchEnvironmentVariables();
