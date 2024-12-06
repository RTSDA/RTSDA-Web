// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig, fetchAndActivate, getValue as getRemoteConfigValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { envReady } from './env-loader.js';

let app;
let db;
let auth;
let remoteConfig;
let configInitialized = false;
let remoteConfigInitialized = false;
let cachedConfig = {};

// Firebase configuration initialization
function getFirebaseConfig() {
    const env = window.__env || window.env;
    if (!env) {
        throw new Error('Environment configuration not found');
    }

    // Required Firebase configuration fields
    const requiredFields = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !env[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
    }

    // Return Firebase configuration object
    return {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
        measurementId: env.FIREBASE_MEASUREMENT_ID
    };
}

// Initialize Firebase and all services
async function initializeFirebase() {
    try {
        console.log('Starting Firebase initialization...');
        
        // Wait for environment variables to be ready
        console.log('Waiting for environment variables...');
        await envReady;
        console.log('Environment variables ready:', {
            hasFirebaseConfig: Object.keys(getFirebaseConfig()).length > 0,
            envVars: Object.keys(window.__env || {})
        });
        
        // Initialize Firebase with error handling
        const firebaseConfig = getFirebaseConfig();
        if (!firebaseConfig.apiKey) {
            throw new Error('Firebase API key is missing. Check Cloudflare Pages environment variables.');
        }
        console.log('Initializing Firebase with configuration:', {
            projectId: firebaseConfig.projectId,
            hasApiKey: !!firebaseConfig.apiKey,
            authDomain: firebaseConfig.authDomain
        });
        
        app = initializeApp(firebaseConfig);
        
        // Initialize optional Firebase features
        if (firebaseConfig.measurementId) {
            const analytics = getAnalytics(app);
            console.log('Firebase Analytics initialized');
        }
        
        console.log('Firebase initialization successful');

        try {
            console.log('Initializing Remote Config...');
            remoteConfig = getRemoteConfig(app);
            remoteConfig.settings = {
                minimumFetchIntervalMillis: 0,
                fetchTimeoutMillis: 10000
            };
            
            console.log('Fetching Remote Config...');
            await fetchAndActivate(remoteConfig);
            console.log('Remote Config fetched and activated');
            
            // Cache the YouTube API key
            try {
                console.log('Getting YouTube API key from Remote Config...');
                const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
                if (youtubeApiKey) {
                    const keyValue = youtubeApiKey.asString();
                    if (keyValue && keyValue.trim() !== '') {
                        console.log('YouTube API key found in Remote Config');
                        cachedConfig['youtube_api_key'] = keyValue;
                    } else {
                        console.warn('YouTube API key in Remote Config is empty');
                    }
                } else {
                    console.warn('YouTube API key not found in Remote Config');
                }
            } catch (error) {
                console.error('Error caching YouTube API key:', error);
                if (error.code) console.error('Error code:', error.code);
                if (error.message) console.error('Error message:', error.message);
            }

            remoteConfigInitialized = true;
        } catch (configError) {
            console.error('Error with Remote Config:', configError);
            if (configError.code) console.error('Error code:', configError.code);
            if (configError.message) console.error('Error message:', configError.message);
            // Don't throw the error, just log it and continue
        }

        db = getFirestore(app);
        console.log('Firestore initialized');

        auth = getAuth(app);
        console.log('Auth initialized');

        configInitialized = true;

        return { app, db, remoteConfig };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        console.error('Error details:', error.message);
        if (error.code) console.error('Error code:', error.code);
        throw error;
    }
}

// Helper function to get config values
async function getValue(key) {
    try {
        // Wait for Firebase initialization
        if (!configInitialized) {
            console.log('Waiting for Firebase initialization...');
            await new Promise(resolve => {
                const checkInit = () => {
                    if (configInitialized) {
                        resolve();
                    } else {
                        setTimeout(checkInit, 100);
                    }
                };
                checkInit();
            });
        }

        // First check the cache
        if (key && typeof key === 'string' && cachedConfig[key]) {
            console.log(`Found ${key} in cache`);
            return cachedConfig[key];
        }

        // If not in cache and Remote Config is initialized, try to get from Remote Config
        if (remoteConfigInitialized && remoteConfig) {
            console.log(`Getting ${key} from Remote Config...`);
            try {
                const value = getRemoteConfigValue(remoteConfig, key);
                if (value) {
                    const stringValue = value.asString();
                    if (stringValue && stringValue.trim() !== '') {
                        console.log(`Got ${key} from Remote Config`);
                        cachedConfig[key] = stringValue;
                        return stringValue;
                    }
                }
                console.warn(`${key} not found in Remote Config or is empty`);
            } catch (error) {
                console.error(`Error getting ${key} from Remote Config:`, error);
            }
        } else {
            console.warn('Remote Config not initialized yet');
        }

        return null;
    } catch (error) {
        console.error('Error getting value for key:', key, error);
        return null;
    }
}

// Create a service class to match Android implementation
class PrayerRequestService {
    constructor() {
        if (!db) throw new Error('Firebase must be initialized before using PrayerRequestService');
        this.collection = collection(db, "prayerRequests");
    }
    
    async submitRequest(request) {
        return await addDoc(this.collection, {
            ...request,
            timestamp: serverTimestamp()
        });
    }
    
    subscribeToRequests(callback) {
        const q = query(this.collection, orderBy("timestamp", "desc"));
        return onSnapshot(q, (snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });
            callback(requests);
        });
    }
    
    async updateRequestStatus(requestId, newStatus) {
        const docRef = doc(this.collection, requestId);
        await updateDoc(docRef, { status: newStatus });
    }
    
    async deleteRequest(requestId) {
        const docRef = doc(this.collection, requestId);
        await deleteDoc(docRef);
    }
}

export { initializeFirebase, db, auth, PrayerRequestService, getValue, getRemoteConfig };