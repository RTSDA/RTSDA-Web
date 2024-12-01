# RTSDA Church Website

This is the official website for the Rockville-Tolland SDA Church.

## Setup Instructions

1. Clone the repository
2. Copy `.env.template` to `.env` and fill in your environment variables:
   ```bash
   cp .env.template .env
   ```
3. Edit `.env` with your actual API keys and configuration values:
   - Firebase configuration
   - YouTube API key
   - Google Maps API key (if used)

## Environment Variables

The following environment variables are required:

### Firebase Configuration
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID

### API Keys
- `YOUTUBE_API_KEY`: YouTube Data API key for sermon videos
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (if used)

## Security Notes

- Never commit the `.env` file to version control
- Always use environment variables for sensitive information
- Keep API keys and credentials secure

## License

This project uses a dual licensing approach:

### Application Source Code
The website's source code, including HTML, CSS, JavaScript, and other technical implementations, 
is licensed under the GNU General Public License v3 (GPLv3). See the [LICENSE](LICENSE) file 
for details.

### Church Content
The website content (including text, images, media, event information, and other church-specific 
materials) is copyrighted by the Rockville-Tolland Seventh-day Adventist Church. All rights 
reserved. These materials are not covered by the GPL license and require proper authorization 
for use.

### Third-Party Content
This website may include third-party content (such as Bible texts, denominational materials, 
and external service integrations) that are subject to their own copyright and usage 
restrictions.

## Contact

For technical inquiries and contributions:
- Open an issue or pull request on GitHub
- Contact the website maintainers

For permissions regarding church content usage:
Rockville-Tolland Seventh-day Adventist Church
Administrative Office
[Church Address]
[Contact Information]
