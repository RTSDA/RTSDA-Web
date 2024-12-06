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

// Initialize promise to track Firebase initialization
let firebaseInitPromise = null;

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
    // If already initialized or initializing, return the promise
    if (firebaseInitPromise) {
        return firebaseInitPromise;
    }

    // Create a new initialization promise
    firebaseInitPromise = (async () => {
        try {
            console.log('firebase-config.js: Waiting for environment variables...');
            await envReady;
            console.log('firebase-config.js: Environment variables loaded, getting Firebase config...');
            
            const config = getFirebaseConfig();
            console.log('firebase-config.js: Got Firebase config, initializing app...');

            // Initialize Firebase app if not already initialized
            if (!app) {
                app = initializeApp(config);
                console.log('firebase-config.js: Firebase app initialized');
            }

            // Initialize Firestore if not already initialized
            if (!db) {
                db = getFirestore();  // Don't pass app in v10
                console.log('firebase-config.js: Firestore initialized');
            }

            // Initialize Auth if not already initialized
            if (!auth) {
                auth = getAuth();  // Don't pass app in v10
                console.log('firebase-config.js: Auth initialized');
            }

            // Initialize Remote Config if not already initialized
            if (!remoteConfig) {
                remoteConfig = getRemoteConfig();  // Don't pass app in v10
                remoteConfig.settings = {
                    minimumFetchIntervalMillis: 3600000, // 1 hour
                    fetchTimeoutMillis: 60000 // 1 minute
                };
                console.log('firebase-config.js: Remote Config initialized');
                
                try {
                    await fetchAndActivate(remoteConfig);
                    remoteConfigInitialized = true;
                    console.log('firebase-config.js: Remote Config activated');
                } catch (error) {
                    console.error('firebase-config.js: Error activating Remote Config:', error);
                }
            }

            // Initialize Analytics if measurementId is provided
            if (config.measurementId) {
                getAnalytics();  // Don't pass app in v10
                console.log('firebase-config.js: Analytics initialized');
            }

            configInitialized = true;
            console.log('firebase-config.js: All Firebase services initialized successfully');
            return app;
        } catch (error) {
            console.error('firebase-config.js: Error initializing Firebase:', error);
            firebaseInitPromise = null;  // Reset the promise so we can try again
            throw error;
        }
    })();

    return firebaseInitPromise;
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
export class PrayerRequestService {
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

export { db, auth, remoteConfig };