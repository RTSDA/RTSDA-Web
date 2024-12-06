import { getEnvVar } from './env-config.js';
import { getValue } from './firebase-config.js';

const CHANNEL_ID = 'UCH3GQ7cC1gvTSEbTSg2jW3Q';  // Fixed channel ID

// Cache configuration
const CACHE_DURATION = {
    SERMON: 24 * 60 * 60 * 1000,     // 24 hours for sermons
    LIVESTREAM: 5 * 60 * 1000   // 5 minutes for livestreams
};

// Singleton instance
let instance = null;

class YouTubeService {
    constructor() {
        if (instance) {
            return instance;
        }
        this.initializeService();
        instance = this;
        return instance;
    }

    async initializeService() {
        try {
            // Try to load cache from localStorage
            const savedCache = localStorage.getItem('youtubeCache');
            const savedLastFetch = localStorage.getItem('youtubeLastFetch');
            
            if (savedCache && savedLastFetch) {
                this.cache = JSON.parse(savedCache);
                this.lastFetch = JSON.parse(savedLastFetch);
            } else {
                this.resetCache();
            }
        } catch (error) {
            console.error('Error initializing YouTubeService:', error);
            this.resetCache();
        }
    }

    resetCache() {
        this.cache = {
            sermon: null,
            livestream: null
        };
        this.lastFetch = {
            sermon: 0,
            livestream: 0
        };
    }

    static getInstance() {
        if (!instance) {
            instance = new YouTubeService();
        }
        return instance;
    }

    async getApiKey() {
        try {
            console.log('Getting YouTube API key from Remote Config...');
            const youtubeApiKey = await getValue('youtube_api_key');
            if (!youtubeApiKey) {
                console.error('YouTube API key not found in Remote Config');
                return null;
            }
            console.log('Successfully got YouTube API key from Remote Config');
            return youtubeApiKey;
        } catch (error) {
            console.error('Error getting YouTube API key from Remote Config:', error);
            return null;
        }
    }

    async fetchFromYouTube(endpoint, params = {}) {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                throw new Error('No YouTube API key available');
            }

            const baseUrl = 'https://www.googleapis.com/youtube/v3';
            const queryParams = new URLSearchParams({
                ...params,
                key: apiKey,
                channelId: CHANNEL_ID
            });

            const response = await fetch(`${baseUrl}${endpoint}?${queryParams}`);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching from YouTube:', error);
            throw error;
        }
    }

    async getUpcomingLivestream() {
        try {
            // Check cache first
            if (this.cache.livestream && 
                Date.now() - this.lastFetch.livestream < CACHE_DURATION.LIVESTREAM) {
                return this.cache.livestream;
            }

            const data = await this.fetchFromYouTube('/search', {
                part: 'snippet,id',
                eventType: 'upcoming',
                type: 'video',
                order: 'date',
                maxResults: 1,
                fields: 'items(id/videoId,snippet/title,snippet/description,snippet/publishedAt,snippet/liveBroadcastContent)'
            });

            console.log('YouTube API response:', data);

            if (!data.items || data.items.length === 0) {
                // Try searching for live streams as well
                const liveData = await this.fetchFromYouTube('/search', {
                    part: 'snippet,id',
                    eventType: 'live',
                    type: 'video',
                    order: 'date',
                    maxResults: 1,
                    fields: 'items(id/videoId,snippet/title,snippet/description,snippet/publishedAt,snippet/liveBroadcastContent)'
                });

                console.log('YouTube API live response:', liveData);

                if (liveData.items && liveData.items.length > 0) {
                    const livestream = {
                        videoId: liveData.items[0].id.videoId,
                        title: liveData.items[0].snippet.title,
                        description: liveData.items[0].snippet.description,
                        scheduledStartTime: 'Live Now',
                        isLive: true
                    };

                    this.cache.livestream = livestream;
                    this.lastFetch.livestream = Date.now();
                    this.saveCache();

                    return livestream;
                }

                this.cache.livestream = null;
                this.lastFetch.livestream = Date.now();
                this.saveCache();
                return null;
            }

            const livestream = {
                videoId: data.items[0].id.videoId,
                title: data.items[0].snippet.title,
                description: data.items[0].snippet.description,
                scheduledStartTime: data.items[0].snippet.publishedAt,
                isLive: false
            };

            this.cache.livestream = livestream;
            this.lastFetch.livestream = Date.now();
            this.saveCache();

            return livestream;
        } catch (error) {
            console.error('Error getting upcoming livestream:', error);
            // Return cached data if available, even if expired
            return this.cache.livestream;
        }
    }

    async getLatestSermon() {
        // Check cache first
        if (this.isCacheValid('sermon') && this.cache.sermon) {
            console.log('Using cached sermon data');
            return this.cache.sermon;
        }

        console.log('Fetching latest sermon...');
        
        try {
            // Get API key from Remote Config
            console.log('Getting YouTube API key...');
            const apiKey = await this.getApiKey();
            console.log('API key available:', !!apiKey);
            
            if (!apiKey) {
                console.error('YouTube API key not available');
                return {
                    title: 'Latest Sermon',
                    description: 'Unable to fetch latest sermon at this time.',
                    videoId: null,
                    error: 'API key not available'
                };
            }

            // First get a list of recent videos
            console.log('Fetching recent videos...');
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=50&type=video`;
            console.log('Search URL:', searchUrl.replace(apiKey, '[REDACTED]'));
            const searchResponse = await fetch(searchUrl);
            console.log('Search response status:', searchResponse.status);
            
            if (!searchResponse.ok) {
                const error = await searchResponse.json();
                console.error('YouTube API error:', error);
                return {
                    title: 'Latest Sermon',
                    description: 'Unable to fetch latest sermon at this time.',
                    videoId: null,
                    error: error.error ? error.error.message : 'Unknown error'
                };
            }

            const searchData = await searchResponse.json();
            console.log('Found videos:', searchData.items?.length || 0);
            
            if (!searchData.items || searchData.items.length === 0) {
                console.warn('No videos found');
                return {
                    title: 'Latest Sermon',
                    description: 'No recent sermons found.',
                    videoId: null,
                    error: 'No videos found'
                };
            }

            // Get video IDs
            const videoIds = searchData.items.map(item => item.id.videoId).join(',');
            console.log('Fetching details for videos:', videoIds);

            // Get detailed video information including duration
            const videosUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=snippet,contentDetails`;
            console.log('Videos URL:', videosUrl.replace(apiKey, '[REDACTED]'));
            const videosResponse = await fetch(videosUrl);
            console.log('Videos response status:', videosResponse.status);

            const videosData = await videosResponse.json();

            // Find all videos that match sermon criteria
            const sermons = videosData.items
                .map(video => {
                    try {
                        const title = video.snippet.title.toLowerCase();
                        const description = video.snippet.description.toLowerCase();
                        const duration = this.getDurationInMinutes(video.contentDetails?.duration);
                        const publishedAt = new Date(video.snippet.publishedAt);
                        
                        // Check if it's not a short (longer than 15 minutes)
                        const isLongEnough = duration >= 15;
                        
                        // Check if it's NOT a worship service
                        const serviceKeywords = ['worship service', 'sabbath service', 'divine service', 'church service'];
                        const isNotWorshipService = !serviceKeywords.some(keyword => 
                            title.includes(keyword)
                        );
                        
                        // Check if it's not a livestream
                        const notLivestream = video.snippet.liveBroadcastContent === 'none';
                        
                        // Look for sermon keywords or check if it's a sermon based on duration
                        const sermonKeywords = ['sermon', 'message', 'preaching'];
                        const hasSermonKeywords = sermonKeywords.some(keyword =>
                            title.includes(keyword) ||
                            description.includes(keyword)
                        );
                        
                        // Consider it a sermon if it has keywords or is long enough and not a service
                        const isSermon = hasSermonKeywords || (isLongEnough && isNotWorshipService);
                        
                        // Log decision factors
                        console.log('Video analysis:', {
                            title,
                            publishedAt: publishedAt.toISOString(),
                            duration,
                            isLongEnough,
                            isNotWorshipService,
                            hasSermonKeywords,
                            isSermon,
                            notLivestream
                        });
                        
                        if (isSermon && notLivestream) {
                            return {
                                video,
                                publishedAt,
                                duration
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error('Error processing video:', video, error);
                        return null;
                    }
                })
                .filter(Boolean)
                .sort((a, b) => b.publishedAt - a.publishedAt);

            console.log('Found sermons:', sermons.map(s => ({
                title: s.video.snippet.title,
                publishedAt: s.publishedAt.toISOString(),
                duration: s.duration,
                id: s.video.id
            })));

            if (sermons.length === 0) {
                console.warn('No sermons found in recent videos');
                return {
                    title: 'Latest Sermon',
                    description: 'No recent sermons found.',
                    videoId: null,
                    error: 'No sermons found'
                };
            }

            // Use the most recent sermon
            const sermon = sermons[0].video;

            const latestSermon = {
                title: sermon.snippet.title,
                description: sermon.snippet.description,
                videoId: sermon.id,
                thumbnail: sermon.snippet.thumbnails.high.url
            };

            // Update cache and timestamp
            this.cache.sermon = latestSermon;
            this.lastFetch.sermon = Date.now();
            this.saveCache();
            return latestSermon;
        } catch (error) {
            console.error('Error fetching sermon:', error);
            return {
                title: 'Latest Sermon',
                description: 'Unable to fetch latest sermon at this time.',
                videoId: null,
                error: error.message
            };
        }
    }

    isCacheValid(type) {
        const now = Date.now();
        const lastFetch = this.lastFetch[type];
        
        // If there's no lastFetch timestamp, cache is invalid
        if (!lastFetch) {
            console.log(`Cache ${type} invalid: no previous fetch`);
            return false;
        }
        
        const ageInMs = now - lastFetch;
        const ageInSeconds = Math.floor(ageInMs / 1000);
        const ageInMinutes = Math.floor(ageInSeconds / 60);
        const ageInHours = Math.floor(ageInMinutes / 60);
        const ageInDays = Math.floor(ageInHours / 24);
        
        let ageString;
        if (ageInDays > 0) {
            ageString = `${ageInDays} days`;
        } else if (ageInHours > 0) {
            ageString = `${ageInHours} hours`;
        } else if (ageInMinutes > 0) {
            ageString = `${ageInMinutes} minutes`;
        } else {
            ageString = `${ageInSeconds} seconds`;
        }
        
        const isValid = ageInMs < CACHE_DURATION[type.toUpperCase()];
        console.log(`Cache ${type} ${isValid ? 'valid' : 'invalid'}: age ${ageString}`);
        return isValid;
    }

    // Function to convert YouTube duration to minutes
    getDurationInMinutes(duration) {
        if (!duration) return 0;
        
        try {
            // YouTube duration format: PT#H#M#S
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) {
                console.warn('Invalid duration format:', duration);
                return 0;
            }
            
            const hours = parseInt(match[1] || '0', 10);
            const minutes = parseInt(match[2] || '0', 10);
            const seconds = parseInt(match[3] || '0', 10);
            
            const totalMinutes = (hours * 60) + minutes + (seconds / 60);
            console.log(`Duration parsed: ${duration} -> ${totalMinutes} minutes`);
            return totalMinutes;
        } catch (error) {
            console.error('Error parsing duration:', duration, error);
            return 0;
        }
    }

    saveCache() {
        try {
            localStorage.setItem('youtubeCache', JSON.stringify(this.cache));
            localStorage.setItem('youtubeLastFetch', JSON.stringify(this.lastFetch));
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    }
}

export default YouTubeService;