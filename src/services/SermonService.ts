import { sermonAuthService } from './SermonAuthService';

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  description?: string;
  video_url?: string;
  tags?: string[];
}

class SermonService {
  private static instance: SermonService;
  
  private constructor() {}
  
  public static getInstance(): SermonService {
    if (!SermonService.instance) {
      SermonService.instance = new SermonService();
    }
    return SermonService.instance;
  }

  private async getAuthToken(): Promise<string> {
    return await sermonAuthService.waitForToken();
  }

  private async fetchFromApi(endpoint: string): Promise<Response> {
    console.log('🎯 Fetching from API:', endpoint);
    const token = await this.getAuthToken();
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.status === 401) {
      console.error('❌ Authentication required');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  private parseDateFromString(dateStr: string): Date {
    // Convert date strings like "November 2nd 2024" to Date objects
    const months: { [key: string]: number } = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    const parts = dateStr.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)\s+(\d+)/);
    if (!parts) return new Date(0);

    const [, month, day, year] = parts;
    return new Date(parseInt(year), months[month], parseInt(day));
  }

  public async fetchYears(): Promise<string[]> {
    const response = await this.fetchFromApi('/sermons/years');
    const data = await response.json();
    console.log('✅ Years data:', data);
    return data;
  }

  public async fetchMonths(year: string): Promise<string[]> {
    const response = await this.fetchFromApi(`/sermons/${year}/months`);
    const data = await response.json();
    console.log('✅ Months data:', data);
    return data;
  }

  public async fetchSermons(year: string, month: string): Promise<Sermon[]> {
    const response = await this.fetchFromApi(`/sermons/${year}/${month}`);
    const data = await response.json();
    console.log('✅ Sermons data:', data);
    
    // Transform and sort the data
    const sermons = data.map((sermon: any) => ({
      id: sermon.id || String(Math.random()),
      title: sermon.title || 'Untitled Sermon',
      speaker: sermon.speaker || 'Unknown Speaker',
      date: sermon.date || new Date().toISOString(),
      description: sermon.description || '',
      video_url: sermon.video_url || '',
      tags: sermon.tags || []
    }));

    // Sort sermons by date in descending order
    return sermons.sort((a: Sermon, b: Sermon) => {
      const dateA = this.parseDateFromString(a.date);
      const dateB = this.parseDateFromString(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  public async getAllSermons(): Promise<Sermon[]> {
    try {
      console.log('🎯 Getting all sermons...');
      // Get available years
      const years = await this.fetchYears();
      console.log('📅 Available years:', years);
      if (!years.length) return [];

      // Sort years in descending order
      const sortedYears = [...years].sort((a, b) => b.localeCompare(a));
      
      for (const year of sortedYears) {
        // Get months for each year
        const months = await this.fetchMonths(year);
        console.log(`📅 Available months for ${year}:`, months);
        if (!months.length) continue;

        // Sort months in descending order (most recent first)
        const sortedMonths = [...months].sort((a, b) => b.localeCompare(a));

        // Try each month until we find sermons
        for (const month of sortedMonths) {
          const sermons = await this.fetchSermons(year, month);
          if (sermons.length > 0) {
            console.log(`📚 Found ${sermons.length} sermons for ${year}/${month}`, sermons);
            return sermons;
          }
          console.log(`No sermons found for ${year}/${month}`);
        }
      }

      console.log('❌ No sermons found in any available months');
      return [];
    } catch (error) {
      console.error('❌ Error fetching sermons:', error);
      return [];
    }
  }

  public async getLatestSermon(): Promise<Sermon | null> {
    try {
      const sermons = await this.getAllSermons();
      return sermons.length > 0 ? sermons[0] : null;
    } catch (error) {
      console.error('❌ Error fetching latest sermon:', error);
      return null;
    }
  }
}

export const sermonService = SermonService.getInstance();
