import type { Event } from '../types/event.js';
import { cleanHtml } from '../utils/html.js';

const POCKETBASE_URL = 'https://pocketbase.rockvilletollandsda.church';

interface EventResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
        id: string;
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        location?: string;
        location_url?: string;
        image?: string;
        thumbnail?: string;
        category: string;
        is_featured: boolean;
        reoccuring: string;
        created: string;
        updated: string;
    }>;
}

function parseDate(dateString: string): Date {
    // Parse the date in GMT/UTC
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

function formatDate(date: Date): string {
    // Format the date in GMT/UTC
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

export async function getEvents(): Promise<Event[]> {
    console.log('📡 Fetching events from PocketBase...');
    const url = `${POCKETBASE_URL}/api/collections/events/records?sort=start_time`;
    console.log('🔗 URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
        console.error('❌ HTTP Error:', response.status);
        const errorText = await response.text();
        console.error('❌ Server returned error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as EventResponse;
    console.log('✅ Successfully fetched', data.items.length, 'events');
    console.log('📦 Raw event data:', data.items[0]); // Log the first event for debugging
    
    return data.items.map(item => ({
        id: item.id,
        title: item.title,
        description: cleanHtml(item.description),
        startDate: parseDate(item.start_time),
        endDate: parseDate(item.end_time),
        location: item.location,
        location_url: item.location_url,
        image: item.image ? `${POCKETBASE_URL}/api/files/events/${item.id}/${item.image}` : undefined,
        thumbnail: item.thumbnail ? `${POCKETBASE_URL}/api/files/events/${item.id}/${item.thumbnail}` : undefined,
        category: item.category as Event['category'],
        isFeatured: item.is_featured,
        reoccuring: item.reoccuring as Event['reoccuring'],
        created: parseDate(item.created),
        updated: parseDate(item.updated)
    }));
}

export async function addEvent(event: Omit<Event, 'id' | 'created' | 'updated'>): Promise<string> {
    console.log('📤 Adding new event to PocketBase...');
    const url = `${POCKETBASE_URL}/api/collections/events/records`;
    
    // Transform the event data to match PocketBase's expected format
    const pbEvent = {
        title: event.title,
        description: event.description,
        start_time: formatDate(event.startDate),
        end_time: formatDate(event.endDate),
        location: event.location,
        location_url: event.location_url,
        image: event.image,
        thumbnail: event.thumbnail,
        category: event.category,
        is_featured: event.isFeatured,
        reoccuring: event.reoccuring
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pbEvent)
    });

    if (!response.ok) {
        console.error('❌ HTTP Error:', response.status);
        const errorText = await response.text();
        console.error('❌ Server returned error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully added event with ID:', data.id);
    return data.id;
}

export async function updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'created' | 'updated'>>): Promise<void> {
    console.log('📝 Updating event in PocketBase...');
    const url = `${POCKETBASE_URL}/api/collections/events/records/${id}`;
    
    // Transform the event data to match PocketBase's expected format
    const pbEvent: Record<string, any> = {};
    if (event.title !== undefined) pbEvent.title = event.title;
    if (event.description !== undefined) pbEvent.description = event.description;
    if (event.startDate !== undefined) pbEvent.start_time = formatDate(event.startDate);
    if (event.endDate !== undefined) pbEvent.end_time = formatDate(event.endDate);
    if (event.location !== undefined) pbEvent.location = event.location;
    if (event.location_url !== undefined) pbEvent.location_url = event.location_url;
    if (event.image !== undefined) pbEvent.image = event.image;
    if (event.thumbnail !== undefined) pbEvent.thumbnail = event.thumbnail;
    if (event.category !== undefined) pbEvent.category = event.category;
    if (event.isFeatured !== undefined) pbEvent.is_featured = event.isFeatured;
    if (event.reoccuring !== undefined) pbEvent.reoccuring = event.reoccuring;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pbEvent)
    });

    if (!response.ok) {
        console.error('❌ HTTP Error:', response.status);
        const errorText = await response.text();
        console.error('❌ Server returned error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Successfully updated event');
}

export async function deleteEvent(id: string): Promise<void> {
    console.log('🗑️ Deleting event from PocketBase...');
    const url = `${POCKETBASE_URL}/api/collections/events/records/${id}`;
    
    const response = await fetch(url, {
        method: 'DELETE'
    });

    if (!response.ok) {
        console.error('❌ HTTP Error:', response.status);
        const errorText = await response.text();
        console.error('❌ Server returned error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Successfully deleted event');
}

export async function uploadEventImage(id: string, file: File): Promise<string> {
    console.log('📤 Uploading event image to PocketBase...');
    const formData = new FormData();
    formData.append('image', file);

    const url = `${POCKETBASE_URL}/api/collections/events/records/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        body: formData
    });

    if (!response.ok) {
        console.error('❌ HTTP Error:', response.status);
        const errorText = await response.text();
        console.error('❌ Server returned error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully uploaded image');
    return `${POCKETBASE_URL}/api/files/events/${id}/${data.image}`;
} 