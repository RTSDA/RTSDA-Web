#!/bin/bash

# Print environment variable names for debugging (not values)
echo "Checking environment variables..."
for var in FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_PROJECT_ID FIREBASE_STORAGE_BUCKET FIREBASE_MESSAGING_SENDER_ID FIREBASE_APP_ID FIREBASE_MEASUREMENT_ID YOUTUBE_API_KEY; do
    if [ -n "${!var}" ]; then
        echo "$var exists: yes"
    else
        echo "$var exists: no"
    fi
done

# Verify required variables
REQUIRED_VARS="FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_PROJECT_ID FIREBASE_STORAGE_BUCKET FIREBASE_MESSAGING_SENDER_ID FIREBASE_APP_ID"
MISSING_VARS=""

for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        MISSING_VARS="$MISSING_VARS $var"
    fi
done

if [ -n "$MISSING_VARS" ]; then
    echo "Error: Missing required environment variables:$MISSING_VARS"
    exit 1
fi

# Generate the environment configuration for Cloudflare Pages
cat > js/config.js << EOL
// Cloudflare Pages environment configuration
window.__env = {
    FIREBASE_API_KEY: '${FIREBASE_API_KEY}',
    FIREBASE_AUTH_DOMAIN: '${FIREBASE_AUTH_DOMAIN}',
    FIREBASE_PROJECT_ID: '${FIREBASE_PROJECT_ID}',
    FIREBASE_STORAGE_BUCKET: '${FIREBASE_STORAGE_BUCKET}',
    FIREBASE_MESSAGING_SENDER_ID: '${FIREBASE_MESSAGING_SENDER_ID}',
    FIREBASE_APP_ID: '${FIREBASE_APP_ID}',
    FIREBASE_MEASUREMENT_ID: '${FIREBASE_MEASUREMENT_ID:-}',
    YOUTUBE_API_KEY: '${YOUTUBE_API_KEY:-}'
};

// Also set them as window.env for compatibility
window.env = Object.assign({}, window.__env);

// Log configuration status (no sensitive data)
console.log('Environment configuration loaded at:', new Date().toISOString());
console.log('Available configuration keys:', Object.keys(window.__env).join(', '));
EOL

echo "Config file generated successfully in js/config.js"

# Clean up any sensitive files and development artifacts
rm -rf .git
rm -f .env env-*.js config.external.js

# Don't remove config.js as it's needed
