// Default development configuration
window.__env = {};

// Create a promise that will resolve when the configuration is ready
let resolveEnvReady, rejectEnvReady;
window.__envReady = new Promise((resolve, reject) => {
    resolveEnvReady = resolve;
    rejectEnvReady = reject;
});

// Function to validate Firebase configuration
function validateFirebaseConfig() {
    const requiredVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    const missing = requiredVars.filter(key => !window.__env[key] || window.__env[key].trim() === '');
    if (missing.length > 0) {
        throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
    }

    // Validate API key format
    const apiKey = window.__env.FIREBASE_API_KEY;
    if (!apiKey || !apiKey.startsWith('AIza')) {
        throw new Error('Invalid Firebase API key format');
    }
}

// Function to load environment variables from config.js
async function loadConfig() {
    console.log('Loading environment configuration...');
    
    try {
        // Import config.js which is generated during build
        await import('./config.js');
        
        // Log loaded configuration (without sensitive values)
        console.log('Configuration loaded with keys:', Object.keys(window.__env).join(', '));
        
        // Validate the configuration
        validateFirebaseConfig();
        console.log('Configuration validated successfully');
        
        // Resolve the ready promise
        resolveEnvReady(window.__env);
    } catch (error) {
        console.error('Failed to load configuration:', error);
        rejectEnvReady(error);
    }
}

// Start loading configuration
loadConfig();

// Export the ready promise
export const envReady = window.__envReady;
