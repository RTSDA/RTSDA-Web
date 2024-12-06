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

// Function to load environment variables from Cloudflare Pages
function loadCloudflareEnv() {
    console.log('Loading environment variables from Cloudflare Pages...');
    
    const envVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID',
        'FIREBASE_MEASUREMENT_ID',
        'YOUTUBE_API_KEY'
    ];
    
    // Log all window properties for debugging
    console.log('All window properties:', Object.keys(window));
    
    // In Cloudflare Pages, env vars are prefixed with _CLOUDFLARE_
    for (const envVar of envVars) {
        const cfVar = `_CLOUDFLARE_${envVar}`;
        if (cfVar in window) {
            window.__env[envVar] = window[cfVar];
            console.log(`Loaded ${envVar} from Cloudflare Pages (${cfVar})`);
        } else {
            console.log(`Failed to load ${envVar} from Cloudflare Pages (${cfVar})`);
        }
    }
    
    // Log final state
    console.log('Environment variables loaded:', {
        loadedVars: Object.keys(window.__env),
        missingVars: envVars.filter(key => !window.__env[key])
    });
}

// Initialize configuration immediately
window.__env = window.__env || {};

// Try loading configuration multiple times with delays
async function attemptLoad(attempt = 1) {
    console.log(`Configuration load attempt ${attempt}/3`);
    
    try {
        // Try loading from Cloudflare Pages first
        await loadCloudflareEnv();
        
        // Validate the configuration
        try {
            validateFirebaseConfig();
            console.log('Configuration validated successfully');
            return true;
        } catch (validationError) {
            console.warn(`Cloudflare environment validation failed: ${validationError}`);
            
            // If this is the last attempt, throw the error
            if (attempt >= 3) {
                throw validationError;
            }
            
            // Otherwise retry
            console.log(`Retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            return attemptLoad(attempt + 1);
        }
    } catch (error) {
        if (attempt >= 3) {
            console.error('All configuration attempts failed');
            throw error;
        }
        
        console.log(`Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return attemptLoad(attempt + 1);
    }
}

// Start the first attempt
attemptLoad().then(() => {
    console.log('Configuration loaded successfully');
    resolveEnvReady(window.__env);
}).catch(error => {
    console.error('Configuration load failed:', error);
    // Set a flag to indicate configuration failed
    window.__envLoadFailed = true;
    // Reject the ready promise
    rejectEnvReady(error);
});

// Export the ready promise
export const envReady = window.__envReady;
