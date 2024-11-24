// Development environment variables
const ENV_CONFIG = {
    YOUTUBE_API_KEY: 'AIzaSyDkgmB53pyIKvVdfOqknlRUbKur5MJSj-Q',
    FIREBASE_API_KEY: 'AIzaSyBPaOs30siqmS5N8AvEeALe2R_ZQyXEpqs',
    FIREBASE_AUTH_DOMAIN: 'rtsda-b42ce.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'rtsda-b42ce',
    FIREBASE_STORAGE_BUCKET: 'rtsda-b42ce.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '447561031868',
    FIREBASE_APP_ID: '1:447561031868:web:7f2b304b2849a69b2530b9',
    FIREBASE_MEASUREMENT_ID: 'G-MZ37E298NH'
};

export function getEnvVar(key) {
    return ENV_CONFIG[key] || null;
}
