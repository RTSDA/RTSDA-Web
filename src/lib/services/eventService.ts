import type { Event } from '../types/event.js';
import { getEvents as getPocketBaseEvents, addEvent as addPocketBaseEvent, updateEvent as updatePocketBaseEvent, deleteEvent as deletePocketBaseEvent, uploadEventImage } from './pocketBaseService.js';

export async function getEvents(): Promise<Event[]> {
    try {
        const events = await getPocketBaseEvents();
        const now = new Date();
        console.log('🕒 Current time:', now.toISOString());
        
        const filteredEvents = events.filter((event: Event) => {
            const isFuture = event.startDate >= now;
            console.log(`📅 Event "${event.title}":`, {
                startDate: event.startDate.toISOString(),
                isFuture
            });
            return isFuture;
        });

        console.log('🎯 Filtered events:', filteredEvents.length, 'of', events.length, 'total events');
        
        return filteredEvents.sort((a: Event, b: Event) => a.startDate.getTime() - b.startDate.getTime());
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

export async function addEvent(event: Omit<Event, 'id' | 'created' | 'updated'>): Promise<string> {
    try {
        return await addPocketBaseEvent(event);
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
}

export async function updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'created' | 'updated'>>): Promise<void> {
    try {
        await updatePocketBaseEvent(id, event);
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

export async function deleteEvent(id: string): Promise<void> {
    try {
        await deletePocketBaseEvent(id);
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}

export async function uploadImage(id: string, file: File): Promise<string> {
    try {
        return await uploadEventImage(id, file);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
} 