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
    // In Cloudflare Pages, environment variables are available directly on the window object
    Object.keys(window.__env).forEach(key => {
        // Check both direct window property and potential Cloudflare format
        const value = window[key] || window[`__STATIC_${key}`] || window[`NEXT_PUBLIC_${key}`];
        if (value) {
            window.__env[key] = value;
            console.log(`Loaded ${key} from Cloudflare Pages (length: ${value.length})`);
        } else {
            console.log(`Failed to load ${key} from Cloudflare Pages`);
        }
    });
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
