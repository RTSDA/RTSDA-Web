import type { Sermon } from '../types/sermon.js';

const JELLYFIN_URL = 'https://jellyfin.rockvilletollandsda.church';
const JELLYFIN_API_KEY = import.meta.env.VITE_JELLYFIN_API_KEY;

export type MediaType = 'sermons' | 'livestreams';

interface JellyfinItem {
  Id: string;
  Name: string;
  Tags?: string[];
  PremiereDate: string;
  ProductionYear?: number;
  Overview?: string;
  MediaType: string;
  Type: string;
  Path: string;
  DateCreated: string;
}

class SermonService {
  private static instance: SermonService | null = null;
  private libraryId: string | null = null;
  private currentType: MediaType = 'sermons';

  private constructor() {
    console.log('Initializing SermonService');
  }

  public static getInstance(): SermonService {
    if (!SermonService.instance) {
      SermonService.instance = new SermonService();
    }
    return SermonService.instance;
  }

  public setType(type: MediaType) {
    this.currentType = type;
    this.libraryId = null; // Reset library ID when switching types
  }

  private async fetchWithAuth(url: string) {
    const response = await fetch(url, {
      headers: {
        'X-MediaBrowser-Token': JELLYFIN_API_KEY,
        'X-Emby-Authorization': `MediaBrowser Client="RTSDA Web", Device="Browser", DeviceId="rtsda-web", Version="1.0.0", Token="${JELLYFIN_API_KEY}"`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        url: response.url,
        response: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }

  private getStreamUrl(itemId: string): string {
    const url = new URL(`${JELLYFIN_URL}/Videos/${itemId}/stream`);
    url.searchParams.append('static', 'true');
    url.searchParams.append('mediaSourceId', itemId);
    url.searchParams.append('api_key', JELLYFIN_API_KEY);
    return url.toString();
  }

  private mapJellyfinItemToSermon(item: JellyfinItem): Sermon {
    console.log('Mapping Jellyfin item:', {
      name: item.Name,
      premiereDate: item.PremiereDate,
      dateCreated: item.DateCreated
    });

    let title = item.Name;
    let speaker = '';
    
    // Remove file extension if present
    title = title.replace(/\.(mp4|mov)$/, '');
    
    // Try to split into title and speaker
    const parts = title.split(' - ');
    if (parts.length > 1) {
      title = parts[0].trim();
      // Extract just the speaker name without the date
      const speakerPart = parts[1].trim();
      speaker = speakerPart
        .replace(/\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:th|st|nd|rd)?\s*\d{4}$/i, '')
        .replace(/\|/g, '')
        .trim();
    }

    // Parse the UTC date string and adjust to local date
    const rawDate = item.PremiereDate || item.DateCreated;
    const utcDate = new Date(rawDate);
    // Create a new date using the local date components
    const localDate = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      0, 0, 0
    );
    
    console.log('Date processing:', {
      rawDate,
      utcDate: utcDate.toISOString(),
      localDate: localDate.toLocaleString()
    });

    return {
      id: item.Id,
      jellyfinId: item.Id,
      title,
      description: item.Overview || '',
      date: localDate.toISOString(),
      speaker: speaker || 'Unknown Speaker',
      thumbnailUrl: `${JELLYFIN_URL}/Items/${item.Id}/Images/Primary?api_key=${JELLYFIN_API_KEY}`,
      seriesName: item.Tags?.join(', ') || '',
      type: this.currentType
    };
  }

  private async getLibraryId(): Promise<string> {
    if (this.libraryId) return this.libraryId;

    try {
      const response = await this.fetchWithAuth(`${JELLYFIN_URL}/Library/MediaFolders`);
      const data = await response.json();
      console.log('Libraries:', data);
      
      const searchTerm = this.currentType === 'sermons' ? 'sermon' : 'live';
      const library = data.Items?.find((lib: any) => 
        lib.Name.toLowerCase().includes(searchTerm) ||
        lib.Path.toLowerCase().includes(searchTerm)
      );
      
      if (!library) {
        throw new Error(`Could not find ${this.currentType} library`);
      }
      
      console.log(`Found ${this.currentType} library:`, library);
      this.libraryId = library.Id;
      return library.Id;
    } catch (err) {
      console.error('Failed to get library ID:', err);
      throw err;
    }
  }

  async getLatestSermon(): Promise<Sermon | null> {
    try {
      // Temporarily set type to sermons to ensure we get the right library
      const originalType = this.currentType;
      this.currentType = 'sermons';
      
      const libraryId = await this.getLibraryId();
      console.log('Using library ID:', libraryId);
      
      const response = await this.fetchWithAuth(
        `${JELLYFIN_URL}/Items?ParentId=${libraryId}&Fields=Path,PremiereDate,ProductionYear,Overview,DateCreated&Recursive=true&IncludeItemTypes=Movie,Video,Episode&SortBy=DateCreated&SortOrder=Descending&Limit=1`
      );
      const data = await response.json();
      
      // Restore original type
      this.currentType = originalType;
      
      if (!data.Items?.[0]) {
        console.error('No sermon found');
        return null;
      }
      
      return this.mapJellyfinItemToSermon(data.Items[0]);
    } catch (error) {
      console.error('Error fetching latest sermon:', error);
      throw error;
    }
  }

  async getSermons(): Promise<Sermon[]> {
    try {
      const libraryId = await this.getLibraryId();
      console.log('Using library ID:', libraryId);
      
      const response = await this.fetchWithAuth(
        `${JELLYFIN_URL}/Items?ParentId=${libraryId}&Fields=Path,PremiereDate,ProductionYear,Overview,DateCreated&Recursive=true&IncludeItemTypes=Movie,Video,Episode&SortBy=DateCreated&SortOrder=Descending`
      );
      const data = await response.json();
      
      if (!data.Items || !Array.isArray(data.Items)) {
        console.error('No Items array in response:', data);
        return [];
      }
      
      // Filter out items without a Path (they're not actual sermon files)
      const filteredItems = data.Items.filter((item: JellyfinItem) => {
        return item.Path && (item.Path.endsWith('.mp4') || item.Path.endsWith('.mov'));
      });
      
      return filteredItems.map(item => this.mapJellyfinItemToSermon(item));
    } catch (error) {
      console.error('Error fetching sermons:', error);
      throw error;
    }
  }

  async getSermonsByYearAndMonth(): Promise<Record<string, Record<string, Sermon[]>>> {
    const sermons = await this.getSermons();
    const organized: Record<string, Record<string, Sermon[]>> = {};

    sermons.forEach(sermon => {
      const date = new Date(sermon.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!organized[year]) {
        organized[year] = {};
      }
      if (!organized[year][month]) {
        organized[year][month] = [];
      }
      organized[year][month].push(sermon);
    });

    // Sort years in descending order
    return Object.keys(organized)
      .sort((a, b) => Number(b) - Number(a))
      .reduce((acc, year) => {
        acc[year] = organized[year];
        return acc;
      }, {} as Record<string, Record<string, Sermon[]>>);
  }

  async getYears(): Promise<string[]> {
    const sermons = await this.getSermons();
    const years = new Set<string>();
    
    sermons.forEach(sermon => {
      const year = new Date(sermon.date).getFullYear().toString();
      years.add(year);
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }

  async getMonthsForYear(year: string): Promise<string[]> {
    const sermons = await this.getSermons();
    const months = new Set<string>();
    
    sermons.forEach(sermon => {
      const date = new Date(sermon.date);
      if (date.getFullYear().toString() === year) {
        months.add(date.toLocaleString('default', { month: 'long' }));
      }
    });

    // Sort months chronologically
    return Array.from(months).sort((a, b) => {
      return new Date(`${a} 1`).getMonth() - new Date(`${b} 1`).getMonth();
    });
  }

  async getSermonsForYearAndMonth(year: string, month: string): Promise<Sermon[]> {
    const sermons = await this.getSermons();
    
    return sermons.filter(sermon => {
      const date = new Date(sermon.date);
      return (
        date.getFullYear().toString() === year &&
        date.toLocaleString('default', { month: 'long' }) === month
      );
    });
  }
}

export const sermonService = SermonService.getInstance(); 