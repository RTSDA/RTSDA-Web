import { envReady } from './env-config.js';

// Helper functions
function setLoadingState(isLoading, message = 'Loading...') {
    const sermonTitle = document.getElementById('sermon-title');
    const sermonDescription = document.getElementById('sermon-description');
    const sermonVideo = document.getElementById('sermon-video');
    const loadingMessage = document.getElementById('loading-message');
    
    if (isLoading) {
        sermonTitle.textContent = 'Loading...';
        sermonDescription.textContent = message;
        sermonVideo.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'block';
    } else {
        if (loadingMessage) loadingMessage.style.display = 'none';
        sermonVideo.style.display = 'block';
    }
}

function setErrorState(message) {
    const sermonTitle = document.getElementById('sermon-title');
    const sermonDescription = document.getElementById('sermon-description');
    const sermonVideo = document.getElementById('sermon-video');
    const loadingMessage = document.getElementById('loading-message');
    
    sermonTitle.textContent = 'Error';
    sermonDescription.textContent = message;
    sermonVideo.style.display = 'none';
    if (loadingMessage) loadingMessage.style.display = 'none';
}

async function updateLatestSermon(youtubeService) {
    try {
        const latestVideo = await youtubeService.getLatestSermon();
        
        if (latestVideo) {
            const sermonTitle = document.getElementById('sermon-title');
            const sermonDescription = document.getElementById('sermon-description');
            const sermonVideo = document.getElementById('sermon-video');
            
            sermonTitle.textContent = latestVideo.title;
            sermonDescription.textContent = latestVideo.description;
            
            // Set the video URL
            if (latestVideo.videoId) {
                sermonVideo.src = `https://www.youtube.com/embed/${latestVideo.videoId}`;
            }
        } else {
            throw new Error('No videos found');
        }
    } catch (error) {
        console.error('Error updating latest sermon:', error);
        throw error;
    }
}

try {
    setLoadingState(true, 'Initializing app...');
    console.log('Starting app initialization...');
    
    // Wait for environment variables to be ready
    console.log('Waiting for environment variables...');
    await envReady;
    console.log('Environment variables ready');
    
    // Import YouTubeService
    const YouTubeService = (await import('./youtube-service.js')).default;
    
    // Create YouTube service and wait for initialization
    console.log('Creating YouTube service...');
    const youtubeService = new YouTubeService();
    console.log('YouTube service created');
    
    // Then update latest sermon
    await updateLatestSermon(youtubeService);
    
    setLoadingState(false);
} catch (error) {
    console.error('Error initializing app:', error);
    setErrorState('Error loading app: ' + error.message);
}
