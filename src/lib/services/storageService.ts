import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { app } from '../firebase/config';

const storage = getStorage(app);

export async function getEventImageUrl(path: string): Promise<string> {
    try {
        const imageRef = ref(storage, `events/${path}`);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error('Error getting event image URL:', error);
        throw error;
    }
}

export async function uploadEventImage(file: File, path: string): Promise<string> {
    try {
        const imageRef = ref(storage, `events/${path}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error('Error uploading event image:', error);
        throw error;
    }
}

// Cache for default image URLs
const defaultImageCache = new Map<string, string>();

export async function getDefaultEventImage(type: string): Promise<string> {
    // Check cache first
    if (defaultImageCache.has(type)) {
        return defaultImageCache.get(type)!;
    }

    try {
        // Convert type to filename (e.g., "Prayer Meeting" -> "prayer-meeting.webp")
        const filename = `${type.toLowerCase().replace(/\s+/g, '-')}.webp`;
        const url = await getEventImageUrl(`defaults/${filename}`);
        defaultImageCache.set(type, url);
        return url;
    } catch (error) {
        console.error(`Error getting default image for type ${type}:`, error);
        // Return fallback image URL if default not found
        return getEventImageUrl('defaults/default.webp');
    }
} 