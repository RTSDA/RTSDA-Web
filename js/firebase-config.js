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
let cachedConfig = {};

// Get Firebase configuration from environment variables
function getFirebaseConfig() {
    const requiredKeys = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    const missingKeys = requiredKeys.filter(key => !getEnvVar(key));
    if (missingKeys.length > 0) {
        const error = new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
        console.error(error);
        throw error;
    }

    return {
        apiKey: getEnvVar('FIREBASE_API_KEY'),
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('FIREBASE_APP_ID'),
        measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID')
    };
}

// Initialize Firebase and all services
async function initializeFirebase() {
    try {
        console.log('Starting Firebase initialization...');
        
        // Wait for environment variables to be ready
        console.log('Waiting for environment variables...');
        try {
            await envReady;
            console.log('Environment variables ready');
        } catch (error) {
            console.error('Failed to load environment variables:', error);
            throw new Error('Cannot initialize Firebase: environment variables failed to load');
        }
        
        // Initialize Firebase with error handling
        let firebaseConfig;
        try {
            firebaseConfig = getFirebaseConfig();
            console.log('Got Firebase config:', {
                projectId: firebaseConfig.projectId,
                hasApiKey: !!firebaseConfig.apiKey,
                authDomain: firebaseConfig.authDomain
            });
        } catch (error) {
            console.error('Failed to get Firebase config:', error);
            throw new Error('Cannot initialize Firebase: invalid configuration');
        }
        
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized');
        
        // Initialize optional Firebase features
        if (firebaseConfig.measurementId) {
            const analytics = getAnalytics(app);
            console.log('Firebase Analytics initialized');
        }
        
        // Initialize Firestore
        db = getFirestore(app);
        console.log('Firestore initialized');
        
        // Initialize Auth
        auth = getAuth(app);
        console.log('Firebase Auth initialized');
        
        // Initialize Remote Config with default values
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings = {
            minimumFetchIntervalMillis: 3600000, // 1 hour
            fetchTimeoutMillis: 60000 // 1 minute
        };
        
        // Fetch and activate Remote Config
        await fetchAndActivate(remoteConfig);
        console.log('Remote Config initialized and activated');
        remoteConfigInitialized = true;
        
        configInitialized = true;
        console.log('Firebase initialization complete');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        configInitialized = false;
        remoteConfigInitialized = false;
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