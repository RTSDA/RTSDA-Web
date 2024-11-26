#!/bin/bash

# Print environment variable names for debugging (not values)
echo "Checking environment variables..."
echo "FIREBASE_API_KEY exists: ${FIREBASE_API_KEY:+yes}"
echo "FIREBASE_AUTH_DOMAIN exists: ${FIREBASE_AUTH_DOMAIN:+yes}"
echo "FIREBASE_PROJECT_ID exists: ${FIREBASE_PROJECT_ID:+yes}"
echo "FIREBASE_STORAGE_BUCKET exists: ${FIREBASE_STORAGE_BUCKET:+yes}"
echo "FIREBASE_MESSAGING_SENDER_ID exists: ${FIREBASE_MESSAGING_SENDER_ID:+yes}"
echo "FIREBASE_APP_ID exists: ${FIREBASE_APP_ID:+yes}"
echo "FIREBASE_MEASUREMENT_ID exists: ${FIREBASE_MEASUREMENT_ID:+yes}"
echo "YOUTUBE_API_KEY exists: ${YOUTUBE_API_KEY:+yes}"

# Generate the environment configuration for Cloudflare Pages
cat > config.js << EOL
// Cloudflare Pages environment variables
window.__env = {};
window.env = {};

// Set environment variables
const env = {
    FIREBASE_API_KEY: '${FIREBASE_API_KEY}',
    FIREBASE_AUTH_DOMAIN: '${FIREBASE_AUTH_DOMAIN}',
    FIREBASE_PROJECT_ID: '${FIREBASE_PROJECT_ID}',
    FIREBASE_STORAGE_BUCKET: '${FIREBASE_STORAGE_BUCKET}',
    FIREBASE_MESSAGING_SENDER_ID: '${FIREBASE_MESSAGING_SENDER_ID}',
    FIREBASE_APP_ID: '${FIREBASE_APP_ID}',
    FIREBASE_MEASUREMENT_ID: '${FIREBASE_MEASUREMENT_ID}',
    YOUTUBE_API_KEY: '${YOUTUBE_API_KEY}'
};

// Copy to both window.env and window.__env
Object.assign(window.env, env);
Object.assign(window.__env, env);

// Also set them as static environment variables for compatibility
window.__STATIC_FIREBASE_API_KEY = '${FIREBASE_API_KEY}';
window.__STATIC_FIREBASE_AUTH_DOMAIN = '${FIREBASE_AUTH_DOMAIN}';
window.__STATIC_FIREBASE_PROJECT_ID = '${FIREBASE_PROJECT_ID}';
window.__STATIC_FIREBASE_STORAGE_BUCKET = '${FIREBASE_STORAGE_BUCKET}';
window.__STATIC_FIREBASE_MESSAGING_SENDER_ID = '${FIREBASE_MESSAGING_SENDER_ID}';
window.__STATIC_FIREBASE_APP_ID = '${FIREBASE_APP_ID}';
window.__STATIC_FIREBASE_MEASUREMENT_ID = '${FIREBASE_MEASUREMENT_ID}';
window.__STATIC_YOUTUBE_API_KEY = '${YOUTUBE_API_KEY}';

// Log when config is loaded (no sensitive data)
console.log('Environment configuration loaded at:', new Date().toISOString());
EOL

# Clean up any sensitive files and development artifacts
rm -rf .git
rm -f .env env-*.js

# Don't remove config.js as it's needed
