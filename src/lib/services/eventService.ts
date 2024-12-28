import type { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Event } from '../types/event';

const COLLECTION_NAME = 'events';

function convertToDate(dateValue: FirestoreTimestamp | Date | string | number | null | undefined): Date {
    if (!dateValue) {
        return new Date();
    }
    
    // If it's a Firestore Timestamp
    if (typeof dateValue === 'object' && 'toDate' in dateValue) {
        return dateValue.toDate();
    }
    
    // If it's already a Date
    if (dateValue instanceof Date) {
        return dateValue;
    }
    
    // If it's a string or number
    return new Date(dateValue);
}

export async function getEvents(): Promise<Event[]> {
    try {
        const eventsCol = collection(db, COLLECTION_NAME);
        
        // Match the existing index structure
        const q = query(
            eventsCol,
            where('isPublished', '==', true),
            orderBy('startDate', 'asc'),
            orderBy('__name__', 'asc')
        );

        const eventSnapshot = await getDocs(q);
        const now = new Date();

        return eventSnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: convertToDate(data.startDate),
                    endDate: convertToDate(data.endDate),
                    createdAt: convertToDate(data.createdAt),
                    updatedAt: convertToDate(data.updatedAt)
                } as Event;
            })
            .filter(event => event.startDate >= now);
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

export async function addEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const eventsCol = collection(db, COLLECTION_NAME);
        const now = Timestamp.now();
        const docRef = await addDoc(eventsCol, {
            ...event,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
}

export async function updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
        const eventRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(eventRef, {
            ...event,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

export async function deleteEvent(id: string): Promise<void> {
    try {
        const eventRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(eventRef);
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
} 