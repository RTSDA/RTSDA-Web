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
    
    // Log all properties of window that might contain our variables
    console.log('Window object:', {
        hasEnv: 'env' in window,
        env: window.env ? Object.keys(window.env) : null,
        hasProcess: 'process' in window,
        processEnv: window.process?.env ? Object.keys(window.process.env) : null,
        hasENV: 'ENV' in window,
        ENV: window.ENV ? Object.keys(window.ENV) : null,
        has_env_: '_env_' in window,
        _env_: window._env_ ? Object.keys(window._env_) : null
    });
    
    // Log all properties that look like environment variables
    const debugObj = {};
    for (const key of Object.getOwnPropertyNames(window)) {
        if (key.includes('FIREBASE') || key.includes('YOUTUBE') || 
            key.includes('env') || key.includes('ENV') || 
            key.includes('config') || key.includes('CONFIG')) {
            debugObj[key] = {
                type: typeof window[key],
                value: typeof window[key] === 'string' ? 
                    (key.includes('KEY') ? '[REDACTED]' : window[key]) : 
                    (window[key] ? '[EXISTS]' : '[UNDEFINED]')
            };
        }
    }
    console.log('Found environment-like properties:', debugObj);
    
    // Try to get environment variables from the runtime config
    if (typeof window !== 'undefined' && '__runtime_config' in window) {
        console.log('Found runtime config, checking for environment variables...');
        const runtimeConfig = window.__runtime_config;
        for (const envVar of envVars) {
            if (envVar in runtimeConfig) {
                window.__env[envVar] = runtimeConfig[envVar];
                console.log(`Loaded ${envVar} from runtime config`);
            }
        }
    }
    
    // In Cloudflare Pages, env vars are injected into a global env object
    const envSources = [
        window.env,                    // Standard Cloudflare Pages injection
        window.__env,                 // Our custom env object
        window.process?.env,          // Node-style env
        window.ENV,                   // Alternative env object
        window._env_,                 // Alternative env object
        window                        // Direct window properties
    ];
    
    // Try each variable
    for (const envVar of envVars) {
        // Already loaded
        if (window.__env[envVar]) {
            console.log(`${envVar} already loaded`);
            continue;
        }
        
        // Try each possible source
        for (const source of envSources) {
            if (!source) continue;
            
            // Try with common prefixes
            const prefixes = ['', '__STATIC_', 'NEXT_PUBLIC_', 'REACT_APP_', 'VUE_APP_', 'VITE_'];
            for (const prefix of prefixes) {
                const key = prefix + envVar;
                if (source[key]) {
                    window.__env[envVar] = source[key];
                    console.log(`Loaded ${envVar} from source with prefix "${prefix}"`);
                    break;
                }
            }
            
            // Break if we found the variable
            if (window.__env[envVar]) break;
        }
        
        if (!window.__env[envVar]) {
            console.log(`Failed to load ${envVar} from any source`);
        }
    }
    
    // Log final state
    console.log('Final environment state:', {
        loadedVars: Object.keys(window.__env),
        missingVars: envVars.filter(key => !window.__env[key])
    });
}

// Function to load external config
async function loadExternalConfig() {
    try {
        // Since config.external.js is now loaded directly in HTML, just check window.__env
        if (window.__env) {
            const configFromVars = {};
            
            // For each environment variable that uses template literals
            for (const [key, value] of Object.entries(window.__env)) {
                if (typeof value === 'string' && value.includes('${')) {
                    // Try to get the actual value from Cloudflare
                    const varName = value.match(/\$\{([^}]+)\}/)?.[1];
                    if (varName) {
                        const actualValue = await getEnvVar(varName);
                        if (actualValue) {
                            configFromVars[key] = actualValue;
                        }
                    }
                } else {
                    // Keep non-template values
                    configFromVars[key] = value;
                }
            }
            
            // Update window.__env with any values we found
            if (Object.keys(configFromVars).length > 0) {
                Object.assign(window.__env, configFromVars);
                console.log('Updated configuration with Cloudflare values');
                return;
            }
        }
        
        console.warn('No valid configuration found in external config');
    } catch (error) {
        console.warn('Failed to process external config:', error);
    }
}

// Function to load environment variables from .env file for local development
async function loadEnvFile() {
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        console.log('Skipping .env file load in production');
        return;
    }
    
    try {
        console.log('Trying .env file...');
        const response = await fetch('/.env');
        if (!response.ok) throw new Error('Failed to load .env file');
        
        const text = await response.text();
        const vars = text.split('\n')
            .filter(line => line && !line.startsWith('#'))
            .reduce((acc, line) => {
                const [key, value] = line.split('=').map(s => s.trim());
                if (key && value) acc[key] = value;
                return acc;
            }, {});
            
        Object.assign(window.__env, vars);
        console.log('Loaded configuration from .env file');
    } catch (error) {
        console.warn('Failed to load .env file:', error);
    }
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
            
            // Try external config sources
            await Promise.all([
                loadExternalConfig(),
                loadEnvFile()
            ]);
            
            // Validate again after trying all sources
            console.log('All configuration sources tried, validating...');
            try {
                validateFirebaseConfig();
                console.log('Configuration validated successfully');
                return true;
            } catch (finalValidationError) {
                console.warn(`Validation failed on attempt ${attempt}: ${finalValidationError}`);
                
                // If this is the last attempt, throw the error
                if (attempt >= 3) {
                    throw finalValidationError;
                }
                
                // Otherwise retry
                console.log(`Retrying in ${attempt * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                return attemptLoad(attempt + 1);
            }
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
