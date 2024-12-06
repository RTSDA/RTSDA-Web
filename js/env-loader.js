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
    console.log('Searching for environment variables in Cloudflare Pages...');
    
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
    
    // Debug window object properties
    const windowEnvState = {
        hasEnv: !!window.env,
        env: window.env,
        hasProcess: !!window.process,
        processEnv: window.process?.env,
        hasENV: !!window.ENV,
        ENV: window.ENV,
        hasBindings: !!window._bindings,
        bindings: window._bindings
    };
    console.log('Window object:', windowEnvState);

    // Check for environment-like properties
    const envProps = {};
    for (const prop in window) {
        if (prop.includes('env') || prop.includes('ENV') || prop.includes('_bindings')) {
            envProps[prop] = window[prop];
        }
    }
    console.log('Found environment-like properties:', envProps);

    // Try multiple environment variable sources
    const sources = [
        { name: 'window._env', get: (key) => window._env?.[key] },
        { name: 'window.__env', get: (key) => window.__env?.[key] },
        { name: 'window._bindings', get: (key) => window._bindings?.[key] },
        { name: 'window.env', get: (key) => window.env?.[key] },
        { name: 'window.ENV', get: (key) => window.ENV?.[key] },
        { name: 'process.env', get: (key) => window.process?.env?.[key] }
    ];

    for (const envVar of envVars) {
        let found = false;
        for (const source of sources) {
            const value = source.get(envVar);
            if (value) {
                window.__env[envVar] = value;
                console.log(`Loaded ${envVar} from ${source.name}`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.log(`Failed to load ${envVar} from any source`);
        }
    }

    // Log final state
    console.log('Final environment state:', {
        loadedVars: Object.keys(window.__env).filter(key => !!window.__env[key]),
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
