// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig, fetchAndActivate, getValue as getRemoteConfigValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { envReady, getEnvVar } from './env-config.js';

let app;
let db;
let auth;
let remoteConfig;
let configInitialized = false;
let remoteConfigInitialized = false;

// Get Firebase configuration from environment variables
function getFirebaseConfig() {
    const config = {
        apiKey: getEnvVar('FIREBASE_API_KEY'),
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('FIREBASE_APP_ID'),
        measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID')
    };

    // Check if we have the required config
    const missingKeys = Object.entries(config)
        .filter(([key, value]) => key !== 'measurementId' && !value)
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
    }

    return config;
}

// Initialize Firebase and all services
export async function initializeFirebase() {
    try {
        // If already initialized, return the app
        if (app) {
            return app;
        }

        // Wait for environment variables
        await envReady;
        
        // Get Firebase config
        const firebaseConfig = getFirebaseConfig();
        
        // Initialize Firebase app
        app = initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = getFirestore(app);
        
        // Initialize Auth
        auth = getAuth(app);
        
        // Initialize Analytics if we have measurementId
        if (firebaseConfig.measurementId) {
            const analytics = getAnalytics(app);
        }
        
        // Initialize Remote Config
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
        remoteConfig.settings.fetchTimeoutMillis = 60000; // 1 minute
        
        try {
            await fetchAndActivate(remoteConfig);
            remoteConfigInitialized = true;
        } catch (error) {
            console.error('Error initializing remote config:', error);
            // Don't throw here, as we can still proceed without remote config
        }
        
        configInitialized = true;
        return app;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Get a value from Remote Config
export function getValue(key) {
    if (!remoteConfigInitialized) {
        console.warn('Remote config not initialized when getting value for:', key);
        return null;
    }
    
    try {
        const value = getRemoteConfigValue(remoteConfig, key);
        return value ? value.asString() : null;
    } catch (error) {
        console.error('Error getting remote config value:', error);
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

export { db, auth, PrayerRequestService, getRemoteConfig };