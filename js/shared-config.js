// Import the ConfigService
import { ConfigService } from './config-service.js';

// Create a singleton instance
const configService = new ConfigService();

// Function to apply common configurations to all pages
async function applyCommonConfigs() {
    try {
        await configService.initialize();
        
        // Check if website is enabled
        if (!configService.isWebsiteEnabled()) {
            document.body.innerHTML = '<div class="maintenance-mode">Website is currently under maintenance. Please check back later.</div>';
            return;
        }

        // Update page title and description
        document.title = configService.getWebsiteTitle();
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.content = configService.getWebsiteDescription();
        }

        // Update contact information
        const contactEmailElements = document.querySelectorAll('.contact-email');
        const contactEmail = configService.getContactEmail();
        contactEmailElements.forEach(element => {
            if (element.tagName.toLowerCase() === 'a') {
                element.href = `mailto:${contactEmail}`;
            }
            element.textContent = contactEmail;
        });

        // Handle feature toggles
        handleFeatureToggles();
        
        // Dispatch event that config is ready
        window.dispatchEvent(new CustomEvent('configReady', { 
            detail: { configService } 
        }));
    } catch (error) {
        console.error('Error applying common configs:', error);
    }
}

// Handle feature toggles based on current page
function handleFeatureToggles() {
    const currentPage = window.location.pathname.split('/').pop() || 'index';
    
    // Prayer request feature toggle
    const prayerEnabled = configService.isPrayerRequestEnabled();
    const prayerElements = document.querySelectorAll('.prayer-request-section, .prayer-link');
    prayerElements.forEach(element => {
        element.style.display = prayerEnabled ? '' : 'none';
    });

    // Livestream feature toggle
    const livestreamEnabled = configService.isLivestreamEnabled();
    const livestreamElements = document.querySelectorAll('.livestream-section, .livestream-link');
    livestreamElements.forEach(element => {
        element.style.display = livestreamEnabled ? '' : 'none';
    });

    // Page-specific handling
    switch (currentPage.toLowerCase()) {
        case 'prayer':
            if (!prayerEnabled) {
                window.location.href = '/';
            }
            break;
            
        case 'livestream':
            if (!livestreamEnabled) {
                window.location.href = '/';
            }
            break;
            
        case 'admin':
            // Admin-specific configurations
            const adminElements = document.querySelectorAll('.admin-section');
            adminElements.forEach(element => {
                const feature = element.dataset.feature;
                if (feature === 'prayer' && !prayerEnabled) {
                    element.style.display = 'none';
                } else if (feature === 'livestream' && !livestreamEnabled) {
                    element.style.display = 'none';
                }
            });
            break;
    }
}

// Apply configs when DOM is loaded
document.addEventListener('DOMContentLoaded', applyCommonConfigs);

// Export for use in other modules
export { configService };
