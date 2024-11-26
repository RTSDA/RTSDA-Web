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

# Generate the environment configuration
cat > js/config.js << EOL
window.__env = {
    FIREBASE_API_KEY: '${FIREBASE_API_KEY}',
    FIREBASE_AUTH_DOMAIN: '${FIREBASE_AUTH_DOMAIN}',
    FIREBASE_PROJECT_ID: '${FIREBASE_PROJECT_ID}',
    FIREBASE_STORAGE_BUCKET: '${FIREBASE_STORAGE_BUCKET}',
    FIREBASE_MESSAGING_SENDER_ID: '${FIREBASE_MESSAGING_SENDER_ID}',
    FIREBASE_APP_ID: '${FIREBASE_APP_ID}',
    FIREBASE_MEASUREMENT_ID: '${FIREBASE_MEASUREMENT_ID}'
};

// Log when config is loaded (no sensitive data)
console.log('Environment configuration loaded at:', new Date().toISOString());
EOL

# Clean up any sensitive files and development artifacts
rm -rf .git
rm -f .env config.*.js env-*.js
rm -f build.sh
