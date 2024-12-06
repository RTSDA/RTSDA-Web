// This file will be replaced during build with actual values
window.__env = {
    FIREBASE_API_KEY: 'AIzaSyDevelopmentKeyForLocalTesting',
    FIREBASE_AUTH_DOMAIN: 'rtsda-development.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'rtsda-development',
    FIREBASE_STORAGE_BUCKET: 'rtsda-development.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '123456789012',
    FIREBASE_APP_ID: '1:123456789012:web:abcdef1234567890',
    FIREBASE_MEASUREMENT_ID: 'G-DEVELOPMENT123',
    YOUTUBE_API_KEY: '' // Not needed since we get this from Remote Config
};

// Log configuration load time
console.log('Environment configuration loaded at:', new Date().toISOString());
console.log('Available configuration keys:', Object.keys(window.__env).join(', '));
