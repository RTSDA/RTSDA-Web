// Default development configuration
window.__env = {};

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
    if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid Firebase API key format');
    }
}

// Function to load environment variables from Cloudflare Pages
function loadCloudflareEnv() {
    console.log('Searching for environment variables...');
    
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
    
    envVars.forEach(key => {
        // Try all possible prefixes
        let value = prefixes.reduce((found, prefix) => {
            if (found) return found;
            const fullKey = prefix + key;
            
            // Check for encrypted variable format
            let val = window[fullKey];
            if (typeof val === 'string' && val.includes('encrypted')) {
                console.log(`Found encrypted ${key} with prefix "${prefix}"`);
                // The actual value should be in window.__env already
                val = window.__env[key];
            }
            
            if (val) {
                console.log(`Found ${key} with prefix "${prefix}"`);
            }
            return val;
        }, null);

        if (value && value.trim() !== '') {
            window.__env[key] = value;
            console.log(`Loaded ${key} (length: ${value.length})`);
            
            // Special logging for API key
            if (key === 'FIREBASE_API_KEY') {
                console.log('API key validation:', {
                    exists: true,
                    length: value.length,
                    startsWithAIza: value.startsWith('AIza'),
                    containsWhitespace: /\s/.test(value),
                    isEncrypted: value.includes('encrypted')
                });
            }
        } else {
            console.log(`Failed to load ${key}`);
        }
    });

    // Log final state of window.__env
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
        
        // Validate Firebase configuration
        validateFirebaseConfig();
        return;
    } catch (error) {
        console.warn('Failed to load Cloudflare environment variables:', error);
    }

    try {
        // Fallback to external config file
        const response = await fetch('/config.external.js');
        if (!response.ok) throw new Error('Failed to load external config');
        
        const text = await response.text();
        const configFunc = new Function('window', text);
        const tempWindow = {};
        configFunc(tempWindow);
        
        if (tempWindow.__remoteConfig) {
            Object.assign(window.__env, tempWindow.__remoteConfig);
            validateFirebaseConfig();
            return;
        }
    } catch (error) {
        console.error('Failed to load external config:', error);
        throw new Error('No valid configuration found');
    }
}

// Load environment variables from .env file for local development
async function loadEnvFile() {
    try {
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
        validateFirebaseConfig();
    } catch (error) {
        console.warn('Failed to load .env file:', error);
        // Continue with other config sources
    }
}

// Initialize configuration immediately
window.__env = window.__env || {};

// Load all configurations
Promise.all([
    loadExternalConfig(),
    loadEnvFile()
]).catch(error => {
    console.error('Failed to load configuration:', error);
    throw error;
});
