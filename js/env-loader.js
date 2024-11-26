// Default development configuration
window.__env = {};

// Create a promise that will resolve when the configuration is ready
window.__envReady = new Promise((resolve, reject) => {
    window.__envResolve = resolve;
    window.__envReject = reject;
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
    
    const prefixes = ['', '__STATIC_', 'NEXT_PUBLIC_', 'REACT_APP_', 'VUE_APP_'];
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
    
    // Log all available window properties that might be environment variables
    console.log('Available window properties:', 
        Object.keys(window)
            .filter(key => envVars.some(envVar => key.includes(envVar)))
            .reduce((acc, key) => {
                acc[key] = window[key] ? '[EXISTS]' : '[UNDEFINED]';
                return acc;
            }, {})
    );
    
    // First check if variables are directly on window
    envVars.forEach(key => {
        if (window[key]) {
            const value = window[key];
            console.log(`Found ${key} directly on window:`, {
                exists: true,
                length: value.length,
                isString: typeof value === 'string',
                isEncrypted: value.includes('encrypted'),
                startsWithAIza: key === 'FIREBASE_API_KEY' ? value.startsWith('AIza') : undefined
            });
            window.__env[key] = value;
        }
    });
    
    // Then try with prefixes
    envVars.forEach(key => {
        if (window.__env[key]) {
            console.log(`Skipping ${key} as it's already loaded`);
            return; // Skip if already found
        }
        
        // Try all possible prefixes
        prefixes.forEach(prefix => {
            const fullKey = prefix + key;
            let value = window[fullKey];
            
            if (value) {
                console.log(`Checking ${fullKey}:`, {
                    exists: true,
                    type: typeof value,
                    length: value.length,
                    isEncrypted: value.includes('encrypted'),
                    startsWithAIza: key === 'FIREBASE_API_KEY' ? value.startsWith('AIza') : undefined
                });
                
                // Handle encrypted values
                if (typeof value === 'string' && value.includes('encrypted')) {
                    console.log(`Found encrypted ${key} with prefix "${prefix}", checking window.__env`);
                    // For encrypted values, Cloudflare should have already injected the decrypted value
                    const decryptedValue = window.__env[key];
                    if (decryptedValue) {
                        console.log(`Found decrypted value for ${key}`);
                        value = decryptedValue;
                    } else {
                        console.warn(`No decrypted value found for ${key}`);
                    }
                }

                if (value && value.trim() !== '') {
                    window.__env[key] = value;
                    console.log(`Loaded ${key}:`, {
                        length: value.length,
                        startsWithAIza: key === 'FIREBASE_API_KEY' ? value.startsWith('AIza') : undefined
                    });
                }
            }
        });
        
        if (!window.__env[key]) {
            console.warn(`Failed to load ${key} from Cloudflare Pages`);
        }
    });

    // Log final state
    console.log('Final environment state:', Object.keys(window.__env).reduce((acc, key) => {
        const value = window.__env[key];
        acc[key] = {
            exists: !!value,
            length: value?.length || 0,
            value: key === 'FIREBASE_API_KEY' ? 
                (value?.startsWith('AIza') ? `${value.substring(0, 4)}...` : 'Invalid format') : 
                '[REDACTED]',
            isEncrypted: value?.includes('encrypted') || false
        };
        return acc;
    }, {}));
}

// Function to load external config
async function loadExternalConfig() {
    try {
        // First try Cloudflare Pages environment variables
        loadCloudflareEnv();
        
        // Check if we got all required variables
        try {
            validateFirebaseConfig();
            console.log('Successfully loaded all required variables from Cloudflare');
            return;
        } catch (error) {
            console.warn('Cloudflare environment validation failed:', error);
            // Continue to try other sources
        }
    } catch (error) {
        console.warn('Failed to load Cloudflare environment variables:', error);
    }

    try {
        // Fallback to external config file
        console.log('Trying external config file...');
        const response = await fetch('/config.external.js');
        if (!response.ok) throw new Error('Failed to load external config');
        
        const text = await response.text();
        const configFunc = new Function('window', text);
        const tempWindow = {};
        configFunc(tempWindow);
        
        if (tempWindow.__remoteConfig) {
            Object.assign(window.__env, tempWindow.__remoteConfig);
            console.log('Loaded configuration from external config file');
            return;
        }
    } catch (error) {
        console.warn('Failed to load external config:', error);
    }
}

// Load environment variables from .env file for local development
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
let attempts = 0;
const maxAttempts = 3;
const attemptDelay = 1000; // 1 second between attempts

function attemptLoad() {
    attempts++;
    console.log(`Configuration load attempt ${attempts}/${maxAttempts}`);
    
    Promise.all([
        loadExternalConfig(),
        loadEnvFile()
    ]).then(() => {
        try {
            console.log('All configuration sources tried, validating...');
            validateFirebaseConfig();
            console.log('Configuration validation successful');
            window.__envResolve(window.__env);
        } catch (error) {
            console.warn(`Validation failed on attempt ${attempts}:`, error);
            if (attempts < maxAttempts) {
                console.log(`Retrying in ${attemptDelay}ms...`);
                setTimeout(attemptLoad, attemptDelay);
            } else {
                console.error('All configuration attempts failed');
                window.__envReject(error);
                throw error;
            }
        }
    }).catch(error => {
        console.error('Configuration load failed:', error);
        if (attempts < maxAttempts) {
            console.log(`Retrying in ${attemptDelay}ms...`);
            setTimeout(attemptLoad, attemptDelay);
        } else {
            window.__envReject(error);
            throw error;
        }
    });
}

// Start the first attempt
attemptLoad();

// Export the ready promise
export const envReady = window.__envReady;
