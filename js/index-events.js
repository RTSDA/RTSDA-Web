import { initializeFirebase, db } from './firebase-config.js';
import { collection, query, orderBy, getDocs, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { envReady } from './env-config.js';

// Helper function to format recurrence type
function formatRecurrenceType(type) {
    if (!type || type === 'NONE') return '';
    return type.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Format date and time
function formatDateTime(date, time) {
    const eventDate = date instanceof Date ? date : date.toDate();
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
}

// Helper function to get the correct HTML file for an event
function getEventPage(title) {
    console.log('getEventPage called with title:', title);
    
    if (!title) {
        console.log('No title provided, returning /events');
        return '/events';
    }
    
    const titleLower = title.toLowerCase().trim();
    console.log('Processed title:', titleLower);
    
    // Check for specific prayer events first
    if (titleLower.includes('prayer')) {
        console.log('Prayer event detected');
        // Check for specific prayer meetings first
        if (titleLower.includes('bi-weekly') || 
            titleLower.includes('biweekly') || 
            titleLower.includes('bi weekly')) {
            console.log('Biweekly prayer detected, returning /biweeklyprayer');
            return '/biweeklyprayer';
        }
        if (titleLower.includes('monthly')) {
            console.log('Monthly prayer detected, returning /monthlyprayermeeting');
            return '/monthlyprayermeeting';
        }
        if (titleLower.includes('new year') || titleLower.includes('end of year')) {
            console.log('New Year prayer detected, returning /newyearprayer');
            return '/newyearprayer';
        }
        console.log('Generic prayer detected, returning /prayer');
        return '/prayer';
    }
    
    if (titleLower.includes('bible study')) {
        console.log('Bible study detected, returning /biblestudyregister');
        return '/biblestudyregister';
    }
    if (titleLower.includes('emmanuel')) {
        console.log('Emmanuel event detected, returning /emmanuel');
        return '/emmanuel';
    }
    
    console.log('No specific event type detected, returning /events');
    return '/events';
}

// Helper function to convert any date format to Date object
function getDate(event) {
    if (!event.startDate) return new Date(0);
    
    if (event.startDate instanceof Date) return event.startDate;
    if (event.startDate instanceof Timestamp) return event.startDate.toDate();
    if (typeof event.startDate === 'number') return new Date(event.startDate * 1000);
    if (event.startDate?.seconds) return new Date(event.startDate.seconds * 1000);
    return new Date(event.startDate);
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('index-events.js: DOM loaded, initializing events...');
    const eventsContainer = document.getElementById('events-container');
    
    if (!eventsContainer) {
        console.error('index-events.js: Events container not found');
        return;
    }
    
    try {
        // Wait for environment variables first
        console.log('index-events.js: Waiting for environment variables...');
        await envReady;
        console.log('index-events.js: Environment variables loaded');
        
        // Initialize Firebase
        await initializeFirebase();
        
        if (!db) {
            throw new Error('Firebase database not initialized');
        }
        
        console.log('index-events.js: Firebase initialized successfully, fetching events...');
        const eventsRef = collection(db, 'events');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const q = query(
            eventsRef,
            where('startDate', '>=', Timestamp.fromDate(today)),
            orderBy('startDate', 'asc')
        );
        
        console.log('index-events.js: Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('index-events.js: Query complete, found', querySnapshot.size, 'events');
        
        if (querySnapshot.empty) {
            eventsContainer.innerHTML = `
                <div class="column event-block">
                    <div class="event-block__content">
                        <h3>No Upcoming Events</h3>
                        <p>Check back soon for new events!</p>
                    </div>
                </div>`;
            return;
        }
        
        // Process and sort events
        const events = querySnapshot.docs
            .map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data };
            })
            .map(event => ({
                ...event,
                startDate: getDate(event),
                endDate: event.endDate ? getDate({ startDate: event.endDate }) : null
            }))
            .sort((a, b) => a.startDate - b.startDate)
            .slice(0, 4); // Only show the next 4 events
        
        console.log('Processed events:', events);
        
        // Generate HTML for events
        const eventsHTML = events.map(event => {
            const eventUrl = getEventPage(event.title);
            const recurrenceLabel = formatRecurrenceType(event.recurrenceType);
            
            return `
                <div class="column event-block">
                    <div class="event-block__content">
                        <h3>
                            <a href="${eventUrl}" class="event-block__title">
                                ${event.title || 'Untitled Event'}
                            </a>
                        </h3>
                        <p class="event-block__date">
                            ${formatDateTime(event.startDate, event.time)}
                        </p>
                        ${event.location ? `<p class="event-block__location">Location: ${event.location}</p>` : ''}
                        ${event.description ? `<p class="event-block__desc">${event.description}</p>` : ''}
                        ${recurrenceLabel ? `<p class="event-block__recurrence">Recurs: ${recurrenceLabel}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        eventsContainer.innerHTML = eventsHTML;
    } catch (error) {
        console.error('Error fetching events:', error);
        eventsContainer.innerHTML = `
            <div class="column event-block">
                <div class="event-block__content">
                    <h3>Error Loading Events</h3>
                    <p>Please try again later.</p>
                </div>
            </div>`;
    }
});
