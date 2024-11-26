#!/bin/bash

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
EOL

# Clean up any sensitive files and development artifacts
rm -rf .git
rm -f .env config.*.js env-*.js
rm -f build.sh
