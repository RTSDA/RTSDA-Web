// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getRemoteConfig, fetchAndActivate, getValue as getRemoteConfigValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-remote-config.js";
import { getFirebaseConfig } from './env-config.js';

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
        // Get config from environment
        const firebaseConfig = await getFirebaseConfig();
        console.log('Firebase configuration loaded successfully');
        
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
        
        // Initialize services
        db = getFirestore(app);
        auth = getAuth(app);
        
        const isDevelopment = window.location.hostname === 'localhost';
        
        if (isDevelopment) {
            console.log('Running in development mode');
            configInitialized = true;
            remoteConfigInitialized = true;
            
            // Use local config in development
            if (window.__remoteConfig && window.__remoteConfig.youtube_api_key) {
                cachedConfig.youtube_api_key = window.__remoteConfig.youtube_api_key;
                console.log('Using local YouTube API key');
            } else {
                console.warn('No YouTube API key found in local config');
            }
        } else {
            // Initialize Remote Config for production
            remoteConfig = getRemoteConfig(app);
            remoteConfig.settings = {
                minimumFetchIntervalMillis: 3600000, // 1 hour
                fetchTimeoutMillis: 60000 // 1 minute
            };
            
            try {
                await fetchAndActivate(remoteConfig);
                console.log('Remote Config activated');
                remoteConfigInitialized = true;
                
                // Cache the YouTube API key
                const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
                if (youtubeApiKey) {
                    cachedConfig['youtube_api_key'] = youtubeApiKey.asString();
                    console.log('Successfully cached YouTube API key from Remote Config');
                } else {
                    console.warn('No YouTube API key found in Remote Config');
                }
            } catch (configError) {
                console.error('Error with Remote Config:', configError);
                remoteConfigInitialized = false;
            }
        }
        
        configInitialized = true;
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        if (error.message.includes('Missing required Firebase configuration')) {
            console.error('Please check that all required environment variables are set');
        }
        throw error;
    }
}

// Helper function to get config values
function getValue(key) {
    if (!configInitialized) {
        console.warn('Firebase not initialized when getting value for:', key);
        return null;
    }

    const isDevelopment = window.location.hostname === 'localhost';
    
    // In development, return from local config
    if (isDevelopment) {
        return window.__remoteConfig?.[key] || null;
    }

    // For production, check Remote Config
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