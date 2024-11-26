// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig, fetchAndActivate, getValue as getRemoteConfigValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";

let app;
let db;
let auth;
let remoteConfig;
let configInitialized = false;
let remoteConfigInitialized = false;
let cachedConfig = {};

// Initialize Firebase and all services
async function initializeFirebase() {
    try {
        if (!window.__env) {
            console.error('Environment configuration missing');
            throw new Error('Environment configuration not found');
        }

        // Log config presence (not values)
        console.log('Config check:', {
            apiKey: !!window.__env.FIREBASE_API_KEY,
            authDomain: !!window.__env.FIREBASE_AUTH_DOMAIN,
            projectId: !!window.__env.FIREBASE_PROJECT_ID,
            storageBucket: !!window.__env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: !!window.__env.FIREBASE_MESSAGING_SENDER_ID,
            appId: !!window.__env.FIREBASE_APP_ID,
            measurementId: !!window.__env.FIREBASE_MEASUREMENT_ID
        });

        const firebaseConfig = {
            apiKey: window.__env.FIREBASE_API_KEY,
            authDomain: window.__env.FIREBASE_AUTH_DOMAIN,
            projectId: window.__env.FIREBASE_PROJECT_ID,
            storageBucket: window.__env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.__env.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.__env.FIREBASE_APP_ID,
            measurementId: window.__env.FIREBASE_MEASUREMENT_ID
        };

        // Initialize Firebase
        console.log('Initializing Firebase...');
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized');

        db = getFirestore(app);
        console.log('Firestore initialized');

        auth = getAuth(app);
        console.log('Auth initialized');

        remoteConfig = getRemoteConfig(app);
        console.log('Remote config initialized');

        // Set up Remote Config
        await fetchAndActivate(remoteConfig);
        console.log('Remote config activated');
        
        // Cache the YouTube API key
        const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
        if (youtubeApiKey) {
            cachedConfig['youtube_api_key'] = youtubeApiKey.asString();
            console.log('Successfully cached YouTube API key from Remote Config');
        } else {
            console.warn('No YouTube API key found in Remote Config');
        }
        
        configInitialized = true;
        remoteConfigInitialized = true;
        
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
            const value = getRemoteConfigValue(remoteConfig, key);
            if (value) {
                return value.asString();
            }
        } catch (error) {
            console.warn(`Error getting ${key} from Remote Config:`, error);
        }
    }

    // Fallback to cached config
    return cachedConfig[key] || null;
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