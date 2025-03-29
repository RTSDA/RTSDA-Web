import type { Bulletin } from '../types/bulletin.js';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://pocketbase.rockvilletollandsda.church';
const POCKETBASE_API_KEY = import.meta.env.VITE_POCKETBASE_API_KEY;

interface BulletinResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
        id: string;
        title: string;
        date: string;
        sabbath_school: string;
        divine_worship: string;
        scripture_reading: string;
        sunset: string;
        url?: string;
        pdf_url?: string;
        is_active: boolean;
        created: string;
        updated: string;
        pdf?: string;
    }>;
}

function parseDate(dateString: string): Date {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

function formatDate(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

const headers = {
    'Content-Type': 'application/json',
    ...(POCKETBASE_API_KEY && { 'Authorization': POCKETBASE_API_KEY })
};

function transformSections(item: BulletinResponse['items'][0]) {
    return [
        { title: 'Sabbath School', content: item.sabbath_school },
        { title: 'Divine Worship', content: item.divine_worship },
        { title: 'Scripture Reading', content: item.scripture_reading },
        { title: 'Sunset', content: item.sunset }
    ].filter(section => section.content);
}

export async function getBulletins(activeOnly = true): Promise<Bulletin[]> {
    let url = `${POCKETBASE_URL}/api/collections/bulletins/records?sort=-date`;
    
    if (activeOnly) {
        url += '&filter=(is_active=true)';
    }
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as BulletinResponse;
    
    return data.items.map(item => ({
        id: item.id,
        title: item.title,
        date: parseDate(item.date),
        sections: transformSections(item),
        url: item.url,
        pdfUrl: item.pdf ? `${POCKETBASE_URL}/api/files/bulletins/${item.id}/${item.pdf}` : undefined,
        isActive: item.is_active,
        created: parseDate(item.created),
        updated: parseDate(item.updated)
    }));
}

export async function getBulletin(id: string): Promise<Bulletin> {
    const url = `${POCKETBASE_URL}/api/collections/bulletins/records/${id}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const item = await response.json();
    
    return {
        id: item.id,
        title: item.title,
        date: parseDate(item.date),
        sections: transformSections(item),
        url: item.url,
        pdfUrl: item.pdf ? `${POCKETBASE_URL}/api/files/bulletins/${item.id}/${item.pdf}` : undefined,
        isActive: item.is_active,
        created: parseDate(item.created),
        updated: parseDate(item.updated)
    };
}

export async function getLatestBulletin(): Promise<Bulletin | null> {
    const bulletins = await getBulletins(true);
    return bulletins.length > 0 ? bulletins[0] : null;
}

export async function addBulletin(bulletin: Omit<Bulletin, 'id' | 'created' | 'updated'>): Promise<string> {
    const url = `${POCKETBASE_URL}/api/collections/bulletins/records`;
    
    const pbBulletin = {
        title: bulletin.title,
        date: formatDate(bulletin.date),
        sections: bulletin.sections,
        url: bulletin.url,
        pdf_url: bulletin.pdfUrl,
        is_active: bulletin.isActive
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(pbBulletin)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
}

export async function updateBulletin(id: string, bulletin: Partial<Omit<Bulletin, 'id' | 'created' | 'updated'>>): Promise<void> {
    const url = `${POCKETBASE_URL}/api/collections/bulletins/records/${id}`;
    
    const pbBulletin: Record<string, any> = {};
    if (bulletin.title !== undefined) pbBulletin.title = bulletin.title;
    if (bulletin.date !== undefined) pbBulletin.date = formatDate(bulletin.date);
    if (bulletin.sections !== undefined) pbBulletin.sections = bulletin.sections;
    if (bulletin.url !== undefined) pbBulletin.url = bulletin.url;
    if (bulletin.pdfUrl !== undefined) pbBulletin.pdf_url = bulletin.pdfUrl;
    if (bulletin.isActive !== undefined) pbBulletin.is_active = bulletin.isActive;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(pbBulletin)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function deleteBulletin(id: string): Promise<void> {
    const url = `${POCKETBASE_URL}/api/collections/bulletins/records/${id}`;
    
    const response = await fetch(url, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export async function uploadBulletinPDF(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('pdf', file);

    const url = `${POCKETBASE_URL}/api/collections/bulletins/records/${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return `${POCKETBASE_URL}/api/files/bulletins/${id}/${data.pdf}`;
} 