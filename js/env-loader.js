// Default development configuration
window.__env = {
    FIREBASE_API_KEY: '',
    FIREBASE_AUTH_DOMAIN: '',
    FIREBASE_PROJECT_ID: '',
    FIREBASE_STORAGE_BUCKET: '',
    FIREBASE_MESSAGING_SENDER_ID: '',
    FIREBASE_APP_ID: '',
    FIREBASE_MEASUREMENT_ID: '',
    YOUTUBE_API_KEY: ''
};

// Function to load environment variables from Cloudflare Pages
function loadCloudflareEnv() {
    // Log all properties on window that might contain our variables
    console.log('Searching for environment variables...');
    
    // Check for environment variables with different prefixes
    const prefixes = ['', '__STATIC_', 'NEXT_PUBLIC_', 'REACT_APP_', 'VUE_APP_'];
    
    Object.keys(window.__env).forEach(key => {
        // Try all possible prefixes
        const value = prefixes.reduce((found, prefix) => {
            if (found) return found;
            const fullKey = prefix + key;
            const val = window[fullKey];
            if (val) {
                console.log(`Found ${key} with prefix "${prefix}"`);
            }
            return val;
        }, null);

        if (value) {
            window.__env[key] = value;
            console.log(`Loaded ${key} (length: ${value.length})`);
            
            // Special logging for API key
            if (key === 'FIREBASE_API_KEY') {
                console.log('API key validation:', {
                    exists: true,
                    length: value.length,
                    startsWithAIza: value.startsWith('AIza'),
                    containsWhitespace: /\s/.test(value)
                });
            }
        } else {
            console.log(`Failed to load ${key}`);
        }
    });

    // Log final state of window.__env
    console.log('Final environment state:', Object.keys(window.__env).reduce((acc, key) => {
        acc[key] = {
            exists: !!window.__env[key],
            length: window.__env[key]?.length || 0
        };
        return acc;
    }, {}));
}

// Function to load external config
async function loadExternalConfig() {
    try {
        // First try Cloudflare Pages environment variables
        loadCloudflareEnv();
        
        // If we have all required variables, return
        if (window.__env.FIREBASE_API_KEY && 
            window.__env.FIREBASE_AUTH_DOMAIN && 
            window.__env.FIREBASE_PROJECT_ID) {
            return;
        }

        // Fallback to external config file if needed
        const response = await fetch('/config.external.js');
        if (!response.ok) throw new Error('Failed to load external config');
        
        const text = await response.text();
        // Safely evaluate the config file
        const configFunc = new Function('window', text);
        const tempWindow = {};
        configFunc(tempWindow);
        
        if (tempWindow.__remoteConfig) {
            // Map the remote config to our env format
            if (tempWindow.__remoteConfig.youtube_api_key) {
                window.__env.YOUTUBE_API_KEY = tempWindow.__remoteConfig.youtube_api_key;
            }
        }
    } catch (error) {
        console.warn('Failed to load external config:', error);
        // Continue with default config
    }
}

// Load environment variables from .env file for local development
async function loadEnvFile() {
    try {
        const response = await fetch('/.env');
        if (!response.ok) throw new Error('Failed to load .env file');
        
        const text = await response.text();
        const env = {};
        text.split('\n').forEach(line => {
            const match = line.match(/^([^#\s][^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim();
            }
        });
        Object.assign(window.__env, env);
    } catch (error) {
        console.warn('Error loading .env file:', error);
        // Continue with existing config
    }
}

// Initialize configuration immediately
window.__env = window.__env || {};

// Load all configurations
Promise.all([loadExternalConfig(), loadEnvFile()])
    .catch(error => {
        console.error('Error loading configurations:', error);
    });
