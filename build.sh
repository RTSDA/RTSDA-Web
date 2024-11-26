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

# Function to properly escape and quote a value
escape_value() {
    local val=$1
    # Escape single quotes and wrap in single quotes
    echo "'${val//\'/\'\\\'\'}'"
}

# Generate the environment configuration
cat > js/config.js << EOL
window.__env = {
    FIREBASE_API_KEY: $(escape_value "$FIREBASE_API_KEY"),
    FIREBASE_AUTH_DOMAIN: $(escape_value "$FIREBASE_AUTH_DOMAIN"),
    FIREBASE_PROJECT_ID: $(escape_value "$FIREBASE_PROJECT_ID"),
    FIREBASE_STORAGE_BUCKET: $(escape_value "$FIREBASE_STORAGE_BUCKET"),
    FIREBASE_MESSAGING_SENDER_ID: $(escape_value "$FIREBASE_MESSAGING_SENDER_ID"),
    FIREBASE_APP_ID: $(escape_value "$FIREBASE_APP_ID"),
    FIREBASE_MEASUREMENT_ID: $(escape_value "$FIREBASE_MEASUREMENT_ID")
};

// For debugging (non-sensitive)
console.log('Firebase config loaded:', Object.keys(window.__env).length, 'variables');
EOL

# Print config.js structure for debugging (without sensitive values)
echo "Generated config.js structure:"
grep -v "'" js/config.js

# Clean up any sensitive files and development artifacts
rm -rf .git
rm -f .env config.*.js env-*.js
rm -f build.sh
