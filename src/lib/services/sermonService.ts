import type { Sermon } from '../types/sermon.js';

const JELLYFIN_URL = 'https://jellyfin.rockvilletollandsda.church';
const POCKETBASE_URL = 'https://pocketbase.rockvilletollandsda.church';

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
  private apiKey: string | null = null;

  private constructor() {
    console.log('Initializing SermonService');
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      const response = await fetch(`${POCKETBASE_URL}/api/collections/config/records/nn753t8o2t1iupd`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Config response:', data); // Debug log
      
      if (!data.api_key?.jellyfin_api_key) {
        throw new Error('Jellyfin API key not found in config');
      }
      this.apiKey = data.api_key.jellyfin_api_key;
      console.log('✅ Successfully initialized Jellyfin API key');
    } catch (error) {
      console.error('Error initializing Jellyfin API key:', error);
      throw error;
    }
  }

  private async ensureApiKey(): Promise<string> {
    if (!this.apiKey) {
      await this.initializeApiKey();
    }
    if (!this.apiKey) {
      throw new Error('Failed to initialize Jellyfin API key');
    }
    return this.apiKey;
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

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const apiKey = await this.ensureApiKey();
    const response = await fetch(url, {
        ...options,
        headers: {
            'X-MediaBrowser-Token': apiKey,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    return response;
  }

  private async getVideoInfo(itemId: string) {
    try {
      const apiKey = await this.ensureApiKey();
      const response = await this.fetchWithAuth(`${JELLYFIN_URL}/Items/${itemId}/PlaybackInfo`);
      const data = await response.json();
      
      // Get more detailed info about the media
      const mediaSource = data.MediaSources?.[0];
      const videoStream = mediaSource?.MediaStreams?.find(
        (stream: any) => stream.Type === 'Video'
      );
      const audioStream = mediaSource?.MediaStreams?.find(
        (stream: any) => stream.Type === 'Audio'
      );

      console.log('Detailed video info:', {
        container: mediaSource?.Container,
        videoCodec: videoStream?.Codec,
        videoProfile: videoStream?.Profile,
        videoBitRate: videoStream?.BitRate,
        width: videoStream?.Width,
        height: videoStream?.Height,
        audioCodec: audioStream?.Codec,
        audioBitRate: audioStream?.BitRate,
        canDirectStream: mediaSource?.SupportsDirectStream,
        canDirectPlay: mediaSource?.SupportsDirectPlay,
        transcodingUrl: mediaSource?.TranscodingUrl,
        requiresTranscoding: mediaSource?.RequiresTranscoding,
        transcodingReasons: mediaSource?.TranscodingReasons
      });

      return data;
    } catch (error) {
      console.error('Error fetching video info:', error);
      return null;
    }
  }

  private async getStreamUrl(itemId: string): Promise<string> {
    try {
        const apiKey = await this.ensureApiKey();
        const playbackInfo = await this.getVideoInfo(itemId);
        const mediaSource = playbackInfo?.MediaSources?.[0];
        
        if (!mediaSource) {
            throw new Error('No media source available');
        }

        // Log full media source info for debugging
        console.log('Full media source info:', mediaSource);

        // Check if browser supports HLS natively (Safari)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator?.userAgent || '');
        
        // Always use HLS for Safari or high bitrate videos
        if (isSafari || (mediaSource.VideoBitRate && mediaSource.VideoBitRate > 2000000)) {
            const hlsUrl = new URL(`${JELLYFIN_URL}/Videos/${itemId}/master.m3u8`);
            hlsUrl.searchParams.append('api_key', apiKey);
            hlsUrl.searchParams.append('MediaSourceId', itemId);
            hlsUrl.searchParams.append('PlaySessionId', playbackInfo.PlaySessionId);
            
            if (isSafari) {
                // Optimized transcoding settings for Safari - focus on faster startup
                hlsUrl.searchParams.append('VideoCodec', 'h264');
                hlsUrl.searchParams.append('AudioCodec', 'aac');
                hlsUrl.searchParams.append('MaxStreamingBitrate', '2000000'); // Lower initial bitrate
                hlsUrl.searchParams.append('VideoBitrate', '2000000');
                hlsUrl.searchParams.append('MaxWidth', '1280');
                hlsUrl.searchParams.append('MaxHeight', '720');
                hlsUrl.searchParams.append('h264-profile', 'main');
                hlsUrl.searchParams.append('h264-level', '41');
                hlsUrl.searchParams.append('SegmentLength', '2'); // Shorter segments for faster startup
                hlsUrl.searchParams.append('EnableFastStartup', 'true');
                hlsUrl.searchParams.append('BreakOnNonKeyFrames', 'true'); // Allow breaking for faster segment generation
                hlsUrl.searchParams.append('MinSegments', '1'); // Start playback sooner
                hlsUrl.searchParams.append('TranscodingMaxAudioChannels', '2');
                hlsUrl.searchParams.append('EnableAdaptiveBitrateStreaming', 'true'); // Enable adaptive streaming
                hlsUrl.searchParams.append('RequireAvc', 'true');
                hlsUrl.searchParams.append('SubtitleMethod', 'Encode');
                hlsUrl.searchParams.append('TranscodingProtocol', 'hls');
                hlsUrl.searchParams.append('TranscodingContainer', 'ts');
                hlsUrl.searchParams.append('CopyTimestamps', 'true');
            } else {
                // Higher quality settings for other browsers
                hlsUrl.searchParams.append('VideoCodec', 'h264,av1');
                hlsUrl.searchParams.append('AudioCodec', 'aac,mp3');
                hlsUrl.searchParams.append('MaxStreamingBitrate', '8000000');
                hlsUrl.searchParams.append('VideoBitrate', '8000000');
                hlsUrl.searchParams.append('MaxWidth', '1920');
                hlsUrl.searchParams.append('MaxHeight', '1080');
                hlsUrl.searchParams.append('h264-profile', 'high');
                hlsUrl.searchParams.append('h264-level', '42');
                hlsUrl.searchParams.append('SegmentLength', '6');
                hlsUrl.searchParams.append('RequireAvc', 'true');
                hlsUrl.searchParams.append('SubtitleMethod', 'Encode');
                hlsUrl.searchParams.append('TranscodingProtocol', 'hls');
                hlsUrl.searchParams.append('TranscodingContainer', 'ts');
                hlsUrl.searchParams.append('CopyTimestamps', 'true');
            }

            // Common settings for all HLS
            hlsUrl.searchParams.append('AudioBitrate', '128000');
            hlsUrl.searchParams.append('AudioSampleRate', '44100');
            hlsUrl.searchParams.append('MaxAudioChannels', '2');
            hlsUrl.searchParams.append('StartTimeTicks', '0');
            hlsUrl.searchParams.append('SubtitleStreamIndex', '-1');
            hlsUrl.searchParams.append('AudioStreamIndex', '1');
            hlsUrl.searchParams.append('EnableSubtitlesInManifest', 'false');
            
            return hlsUrl.toString();
        }
        
        // For direct play capable media and browsers
        if (mediaSource.SupportsDirectPlay && !mediaSource.RequiresTranscoding) {
            const directUrl = new URL(`${JELLYFIN_URL}/Videos/${itemId}/stream`);
            directUrl.searchParams.append('static', 'true');
            directUrl.searchParams.append('mediaSourceId', itemId);
            directUrl.searchParams.append('api_key', apiKey);
            directUrl.searchParams.append('PlaySessionId', playbackInfo.PlaySessionId);
            return directUrl.toString();
        }

        // Default to progressive download as fallback
        const fallbackUrl = new URL(`${JELLYFIN_URL}/Videos/${itemId}/stream`);
        fallbackUrl.searchParams.append('api_key', apiKey);
        fallbackUrl.searchParams.append('MediaSourceId', itemId);
        fallbackUrl.searchParams.append('PlaySessionId', playbackInfo.PlaySessionId);
        fallbackUrl.searchParams.append('VideoCodec', 'h264');
        fallbackUrl.searchParams.append('AudioCodec', 'aac');
        fallbackUrl.searchParams.append('TranscodingContainer', 'ts');
        fallbackUrl.searchParams.append('RequireAvc', 'true');
        return fallbackUrl.toString();
    } catch (error) {
        console.error('Error getting stream URL:', error);
        // Fallback to direct stream if there's an error
        const apiKey = await this.ensureApiKey();
        const fallbackUrl = new URL(`${JELLYFIN_URL}/Videos/${itemId}/stream`);
        fallbackUrl.searchParams.append('api_key', apiKey);
        fallbackUrl.searchParams.append('MediaSourceId', itemId);
        fallbackUrl.searchParams.append('static', 'true');
        return fallbackUrl.toString();
    }
  }

  private async mapJellyfinItemToSermon(item: JellyfinItem): Promise<Sermon> {
    console.log('Mapping Jellyfin item:', {
      name: item.Name,
      premiereDate: item.PremiereDate,
      dateCreated: item.DateCreated
    });

    // Get video codec info
    const videoInfo = await this.getVideoInfo(item.Id);
    if (videoInfo) {
      console.log(`Codec info for ${item.Name}:`, videoInfo);
    }

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

    const apiKey = await this.ensureApiKey();

    return {
      id: item.Id,
      jellyfinId: item.Id,
      title,
      description: item.Overview || '',
      date: localDate.toISOString(),
      speaker: speaker || 'Unknown Speaker',
      thumbnailUrl: `${JELLYFIN_URL}/Items/${item.Id}/Images/Primary?api_key=${apiKey}`,
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
        `${JELLYFIN_URL}/Items?ParentId=${libraryId}&Fields=Path,PremiereDate,ProductionYear,Overview,DateCreated&Recursive=true&IncludeItemTypes=Movie,Video,Episode&SortBy=PremiereDate&SortOrder=Descending`
      );
      const data = await response.json();
      
      // Restore original type
      this.currentType = originalType;
      
      if (!data.Items || !Array.isArray(data.Items)) {
        console.error('No Items array in response:', data);
        return null;
      }

      // Filter out items without a Path or wrong type
      const filteredItems = data.Items.filter((item: JellyfinItem) => {
        const isSermon = item.Path && (item.Path.toLowerCase().includes('sermon') || item.Path.toLowerCase().includes('sermons'));
        const hasValidExtension = item.Path && (item.Path.endsWith('.mp4') || item.Path.endsWith('.mov'));
        return isSermon && hasValidExtension;
      });
      
      if (!filteredItems[0]) {
        console.error('No sermon found after filtering');
        return null;
      }
      
      return this.mapJellyfinItemToSermon(filteredItems[0]);
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
        `${JELLYFIN_URL}/Items?ParentId=${libraryId}&Fields=Path,PremiereDate,ProductionYear,Overview,DateCreated&Recursive=true&IncludeItemTypes=Movie,Video,Episode&SortBy=PremiereDate&SortOrder=Descending`
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
      
      // Use Promise.all to wait for all async mappings to complete
      const sermons = await Promise.all(
        filteredItems.map((item: JellyfinItem) => this.mapJellyfinItemToSermon(item))
      );

      // Sort by premiere date in descending order
      return sermons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching sermons:', error);
      throw error;
    }
  }

  async getSermonsByYearAndMonth(): Promise<Record<string, Record<string, Sermon[]>>> {
    const sermons = await this.getSermons();
    const organized: Record<string, Record<string, Sermon[]>> = {};

    // First organize sermons by year and month
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

    // Sort years in descending order (newest first)
    const sortedYears = Object.keys(organized).sort((a, b) => Number(b) - Number(a));
    
    // Create new object with sorted years and months
    const sortedOrganized = sortedYears.reduce((acc, year) => {
      // Get months for this year and sort them by their actual month number in descending order
      const months = Object.keys(organized[year]).sort((a, b) => {
        const monthOrder = [
          'December', 'November', 'October', 'September', 'August', 'July',
          'June', 'May', 'April', 'March', 'February', 'January'
        ];
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
      });
      
      // Add sorted months to accumulator
      acc[year] = months.reduce((monthAcc, month) => {
        // Sort sermons within each month by date (newest first)
        monthAcc[month] = organized[year][month].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return monthAcc;
      }, {} as Record<string, Sermon[]>);
      
      return acc;
    }, {} as Record<string, Record<string, Sermon[]>>);

    return sortedOrganized;
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

    // Sort months in descending order using fixed month order
    const monthOrder = [
      'December', 'November', 'October', 'September', 'August', 'July',
      'June', 'May', 'April', 'March', 'February', 'January'
    ];
    return Array.from(months).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
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