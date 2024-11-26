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
        measurementId: env.FIREBASE_MEASUREMENT_ID || undefined
    };
}

// Initialize Firebase and all services
async function initializeFirebase() {
    try {
        console.log('Firebase configuration loaded successfully');
        
        // Wait for environment variables to be ready
        await envReady;
        
        // Initialize Firebase with error handling
        const firebaseConfig = getFirebaseConfig();
        console.log('Initializing Firebase with configuration');
        app = initializeApp(firebaseConfig);
        
        // Initialize optional Firebase features
        if (firebaseConfig.measurementId) {
            const analytics = getAnalytics(app);
            console.log('Firebase Analytics initialized');
        }
        
        console.log('Firebase initialization successful');

        try {
            remoteConfig = getRemoteConfig(app);
            await fetchAndActivate(remoteConfig);
            console.log('Remote Config fetched and activated');
        } catch (configError) {
            console.error('Error with Remote Config:', configError);
        }

        db = getFirestore(app);
        console.log('Firestore initialized');

        auth = getAuth(app);
        console.log('Auth initialized');

        remoteConfigInitialized = true;
        configInitialized = true;

        // Cache and validate the YouTube API key
        console.log('Attempting to fetch YouTube API key from Remote Config...');
        const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
        console.log('YouTube API key status:', {
            exists: !!youtubeApiKey,
            type: youtubeApiKey ? typeof youtubeApiKey.asString() : 'undefined',
            length: youtubeApiKey ? youtubeApiKey.asString().length : 0
        });
        
        if (youtubeApiKey) {
            cachedConfig['youtube_api_key'] = youtubeApiKey.asString();
            console.log('Successfully cached YouTube API key from Remote Config');
        } else {
            console.warn('No YouTube API key found in Remote Config');
        }

        return { app, db, remoteConfig };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        console.error('Error details:', error.message);
        if (error.code) console.error('Error code:', error.code);
        throw error;
    }
}

// Helper function to get config values
function getValue(key) {
    console.log(`Getting value for key: ${key}`);
    
    if (!configInitialized) {
        console.warn('Firebase not initialized when getting value for:', key);
        return null;
    }

    // Try Remote Config
    if (!remoteConfigInitialized) {
        console.warn('Remote Config not initialized when getting value for:', key);
        return null;
    }

    // Try Remote Config
    if (remoteConfig) {
        try {
            console.log(`Fetching ${key} from Remote Config...`);
            const value = getRemoteConfigValue(remoteConfig, key);
            if (value) {
                const stringValue = value.asString();
                console.log(`Successfully retrieved ${key} from Remote Config:`, {
                    exists: true,
                    length: stringValue.length,
                    type: typeof stringValue
                });
                return stringValue;
            } else {
                console.warn(`No value found in Remote Config for key: ${key}`);
            }
        } catch (error) {
            console.warn(`Error getting ${key} from Remote Config:`, error);
        }
    }

    // Fallback to cached config
    console.log(`Checking cached config for ${key}...`);
    const cachedValue = cachedConfig[key];
    console.log(`Cached value status for ${key}:`, {
        exists: !!cachedValue,
        type: typeof cachedValue,
        length: cachedValue ? cachedValue.length : 0
    });
    
    return cachedValue || null;
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