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
    console.log('Getting Firebase config...');
    const requiredKeys = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    // Log all available environment variables (excluding sensitive values)
    console.log('Available environment variables:', Object.keys(window.__env).join(', '));

    const missingKeys = requiredKeys.filter(key => {
        const value = getEnvVar(key);
        const exists = !!value;
        console.log(`Checking ${key}: ${exists ? 'Found' : 'Missing'}`);
        return !exists;
    });

    if (missingKeys.length > 0) {
        const error = new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
        console.error(error);
        throw error;
    }

    const config = {
        apiKey: getEnvVar('FIREBASE_API_KEY'),
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('FIREBASE_APP_ID'),
        measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID')
    };

    console.log('Firebase config loaded successfully');
    return config;
}

// Initialize Firebase and all services
export async function initializeFirebase() {
    try {
        console.log('Starting Firebase initialization...');
        
        console.log('Waiting for environment variables to be ready...');
        await envReady;
        console.log('Environment variables are ready');
        
        // Get Firebase config
        const firebaseConfig = getFirebaseConfig();
        console.log('Firebase config loaded with values:', 
            Object.keys(firebaseConfig).map(key => `${key}: ${key === 'apiKey' ? '[REDACTED]' : !!firebaseConfig[key]}`).join(', '));
        
        // Initialize Firebase app if not already initialized
        if (!app) {
            app = initializeApp(firebaseConfig);
            console.log('Firebase app initialized');
            
            // Initialize Firestore
            db = getFirestore(app);
            console.log('Firestore initialized');
            
            // Initialize Auth
            auth = getAuth(app);
            console.log('Auth initialized');
            
            // Initialize Analytics
            if (firebaseConfig.measurementId) {
                const analytics = getAnalytics(app);
                console.log('Analytics initialized');
            }
            
            // Initialize Remote Config
            remoteConfig = getRemoteConfig(app);
            remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
            remoteConfig.settings.fetchTimeoutMillis = 60000; // 1 minute
            
            try {
                await fetchAndActivate(remoteConfig);
                remoteConfigInitialized = true;
                console.log('Remote config initialized');
            } catch (error) {
                console.error('Error initializing remote config:', error);
                // Don't throw here, as we can still proceed without remote config
            }
            
            configInitialized = true;
        }
        
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
        console.log(`Getting Remote Config value for ${key}...`);
        const value = getRemoteConfigValue(remoteConfig, key);
        if (!value) {
            console.warn(`No value found for ${key} in Remote Config`);
            return null;
        }
        const stringValue = value.asString();
        console.log(`Got Remote Config value for ${key}: ${key === 'YOUTUBE_API_KEY' ? '[REDACTED]' : stringValue}`);
        return stringValue;
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