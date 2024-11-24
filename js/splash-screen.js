// Function to create and show splash screen
function createSplashScreen() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Set the preloader background
    preloader.style.cssText = `
        background: linear-gradient(to bottom, #3b0d11, #21070a);
        transition: opacity .3s ease-in-out;
        opacity: 1;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999999;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Remove the default loader
    const defaultLoader = document.getElementById('loader');
    if (defaultLoader) {
        defaultLoader.remove();
    }

    // Create splash content container
    const splashContent = document.createElement('div');
    splashContent.className = 'splash-content';
    splashContent.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 100%;
        max-width: 600px;
        padding: 0 20px;
    `;

    // Create church logo
    const logo = document.createElement('img');
    logo.src = 'sdalogo.webp';
    logo.style.cssText = `
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
    `;

    // Create church name
    const churchName = document.createElement('h1');
    churchName.textContent = 'Rockville-Tolland SDA Church';
    churchName.style.cssText = `
        color: #ffffff;
        margin-bottom: 20px;
        font-size: 2.4rem;
        font-weight: 600;
        font-family: "Montserrat", sans-serif;
    `;

    // Create decorative line
    const line = document.createElement('div');
    line.style.cssText = `
        width: 60px;
        height: 2px;
        background-color: #fb8b23;
        margin: 20px auto;
    `;

    // Create Bible verse container
    const verseContainer = document.createElement('div');
    verseContainer.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.8rem;
        margin-bottom: 10px;
        font-style: italic;
        padding: 0 20px;
        line-height: 1.4;
        font-family: "Lora", serif;
    `;
    verseContainer.id = 'splash-verse';

    // Create reference container
    const referenceContainer = document.createElement('div');
    referenceContainer.style.cssText = `
        color: #fb8b23;
        font-size: 1.4rem;
        font-family: "Montserrat", sans-serif;
    `;
    referenceContainer.id = 'splash-reference';

    // Append all elements
    splashContent.appendChild(logo);
    splashContent.appendChild(churchName);
    splashContent.appendChild(line);
    splashContent.appendChild(verseContainer);
    splashContent.appendChild(referenceContainer);
    preloader.appendChild(splashContent);

    // Get and display a random Bible verse
    const { verse, reference } = window.getRandomVerse();
    verseContainer.textContent = verse;
    referenceContainer.textContent = reference;

    // Remove splash screen after delay
    setTimeout(() => {
        document.documentElement.classList.remove('ss-preload');
        document.documentElement.classList.add('ss-loaded');
        
        setTimeout(() => {
            preloader.style.display = 'none';
            // Clear splash screen content
            preloader.innerHTML = '';
        }, 300);
    }, 2000);
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only show splash screen on first visit of the session
    if (!sessionStorage.getItem('hasVisited')) {
        // Mark that user has visited
        sessionStorage.setItem('hasVisited', 'true');
        createSplashScreen();
    } else {
        // Remove preloader immediately for subsequent visits
        document.documentElement.classList.remove('ss-preload');
        document.documentElement.classList.add('ss-loaded');
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    }
});

// Handle browser back/forward navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was loaded from cache (browser back/forward)
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
            preloader.innerHTML = '';
        }
        document.documentElement.classList.remove('ss-preload');
        document.documentElement.classList.add('ss-loaded');
    }
});

// Reset preloader state when page is about to unload
window.addEventListener('beforeunload', () => {
    document.documentElement.classList.add('ss-preload');
    document.documentElement.classList.remove('ss-loaded');
});
