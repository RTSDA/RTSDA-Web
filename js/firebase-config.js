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
        'FIREBASE_PROJECT_ID',
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
        projectId: env.FIREBASE_PROJECT_ID,
        appId: env.FIREBASE_APP_ID,
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
            remoteConfig.settings = {
                minimumFetchIntervalMillis: 0,
                fetchTimeoutMillis: 10000
            };
            
            await fetchAndActivate(remoteConfig);
            console.log('Remote Config fetched and activated');
            
            // Cache the YouTube API key
            try {
                const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
                if (youtubeApiKey) {
                    cachedConfig['youtube_api_key'] = youtubeApiKey.asString();
                }
            } catch (error) {
                console.error('Error caching YouTube API key:', error);
            }
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

        remoteConfigInitialized = true;
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
function getValue(key) {
    // Try cache first
    if (cachedConfig[key]) {
        return cachedConfig[key];
    }
    
    // Then try Remote Config
    if (remoteConfig && remoteConfigInitialized) {
        try {
            const value = getRemoteConfigValue(remoteConfig, key);
            if (value) {
                const stringValue = value.asString();
                cachedConfig[key] = stringValue;
                return stringValue;
            }
        } catch (error) {
            console.error('Error getting value from Remote Config:', error);
        }
    }
    
    return null;
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