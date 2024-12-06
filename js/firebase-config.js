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
            
            // Set up Remote Config settings based on domain
            const settings = {
                minimumFetchIntervalMillis: 0,  // Always fetch fresh values
                fetchTimeoutMillis: 10000  // 10 second timeout
            };
            remoteConfig.settings = settings;
            
            const currentDomain = window.location.hostname;
            const isPreviewDomain = currentDomain === 'rtsda-web.pages.dev';
            const effectiveDomain = isPreviewDomain ? 'rockvilletollandsda.org' : currentDomain;
            
            console.log('Fetching Remote Config:', {
                currentDomain,
                isPreviewDomain,
                effectiveDomain
            });
            
            // Set default values for Remote Config
            remoteConfig.defaultConfig = {
                youtube_api_key: ''  // Default empty value
            };
            
            await fetchAndActivate(remoteConfig);
            console.log('Remote Config fetched and activated');
            
            // Cache the YouTube API key with domain info
            try {
                const youtubeApiKey = getRemoteConfigValue(remoteConfig, 'youtube_api_key');
                if (youtubeApiKey) {
                    const apiKeyString = youtubeApiKey.asString();
                    console.log('YouTube API key status:', {
                        exists: true,
                        type: typeof apiKeyString,
                        length: apiKeyString.length,
                        currentDomain,
                        effectiveDomain
                    });
                    
                    // Store with both current and effective domain info
                    cachedConfig['youtube_api_key_' + currentDomain] = apiKeyString;
                    cachedConfig['youtube_api_key_' + effectiveDomain] = apiKeyString;
                    // Also store without domain for backward compatibility
                    cachedConfig['youtube_api_key'] = apiKeyString;
                    
                    console.log('Successfully cached YouTube API key for domains:', {
                        currentDomain,
                        effectiveDomain
                    });
                } else {
                    console.warn('No YouTube API key found in Remote Config for domain:', effectiveDomain);
                }
            } catch (apiKeyError) {
                console.error('Error caching YouTube API key:', apiKeyError);
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
    if (typeof key !== 'string') {
        console.error('Invalid key type:', typeof key);
        return null;
    }
    
    const currentDomain = window.location.hostname;
    const isPreviewDomain = currentDomain === 'rtsda-web.pages.dev';
    const effectiveDomain = isPreviewDomain ? 'rockvilletollandsda.org' : currentDomain;
    
    console.log(`Getting value for key: ${key}`, {
        currentDomain,
        isPreviewDomain,
        effectiveDomain
    });
    
    if (!configInitialized) {
        console.warn('Firebase not initialized when getting value for:', key);
        return null;
    }

    // First try current domain-specific cached value
    const currentDomainKey = `${key}_${currentDomain}`;
    const currentDomainValue = cachedConfig[currentDomainKey];
    if (currentDomainValue) {
        console.log(`Found current domain cached value for ${key}:`, {
            exists: true,
            type: typeof currentDomainValue,
            length: currentDomainValue.length,
            preview: currentDomainValue.substring(0, 5) + '...',
            domain: currentDomain
        });
        return currentDomainValue;
    }

    // Then try effective domain cached value
    const effectiveDomainKey = `${key}_${effectiveDomain}`;
    const effectiveDomainValue = cachedConfig[effectiveDomainKey];
    if (effectiveDomainValue) {
        console.log(`Found effective domain cached value for ${key}:`, {
            exists: true,
            type: typeof effectiveDomainValue,
            length: effectiveDomainValue.length,
            preview: effectiveDomainValue.substring(0, 5) + '...',
            domain: effectiveDomain
        });
        return effectiveDomainValue;
    }

    // Then try Remote Config
    if (remoteConfig && remoteConfigInitialized) {
        try {
            console.log(`Fetching ${key} from Remote Config for domain:`, {
                currentDomain,
                effectiveDomain
            });
            const value = getRemoteConfigValue(remoteConfig, key);
            if (value) {
                const stringValue = value.asString();
                console.log(`Successfully retrieved ${key} from Remote Config:`, {
                    exists: true,
                    length: stringValue.length,
                    type: typeof stringValue,
                    preview: stringValue.substring(0, 5) + '...',
                    currentDomain,
                    effectiveDomain
                });
                
                // Cache for both current and effective domains
                cachedConfig[currentDomainKey] = stringValue;
                cachedConfig[effectiveDomainKey] = stringValue;
                cachedConfig[key] = stringValue;
                return stringValue;
            } else {
                console.warn(`No value found in Remote Config for key: ${key}`, {
                    currentDomain,
                    effectiveDomain
                });
            }
        } catch (error) {
            console.warn(`Error getting ${key} from Remote Config:`, error);
        }
    } else {
        console.warn('Remote Config not initialized when getting value for:', key);
    }
    
    // Finally try general cached value
    const generalCachedValue = cachedConfig[key];
    if (generalCachedValue) {
        console.log(`Found general cached value for ${key}:`, {
            exists: true,
            type: typeof generalCachedValue,
            length: generalCachedValue.length,
            preview: generalCachedValue.substring(0, 5) + '...'
        });
        return generalCachedValue;
    }
    
    console.log(`No value found for ${key}`, {
        currentDomain,
        effectiveDomain
    });
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