/**
 * Cleans up HTML content by:
 * 1. Removing table structures and divs
 * 2. Converting HTML tags to line breaks
 * 3. Decoding HTML entities
 * 4. Formatting phone numbers
 * 5. Cleaning up whitespace
 */
export function cleanHtml(html: string): string {
    if (!html) return '';

    // First remove all table structures and divs
    let cleaned = html.replace(/<table[^>]*>.*?<\/table>/g, '');
    cleaned = cleaned.replace(/<div[^>]*>/g, '');
    cleaned = cleaned.replace(/<\/div>/g, '\n');
    
    // Replace other HTML tags
    cleaned = cleaned.replace(/<br\s*\/?>/g, '\n');
    cleaned = cleaned.replace(/<p>/g, '');
    cleaned = cleaned.replace(/<\/p>/g, '\n');
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    
    // Decode common HTML entities
    const htmlEntities = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#39;': "'",
        '&#47;': '/',
        '&rsquo;': "'",
        '&mdash;': '—'
    } as const;
    
    for (const [entity, replacement] of Object.entries(htmlEntities)) {
        cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
    }
    
    // Format phone numbers
    const phonePattern = /Phone:.*?(\+?1?\s*[-.]?\s*)?(\(?\d{3}\)?)\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})/;
    cleaned = cleaned.replace(phonePattern, 'Phone: ($2) $3-$4');
    
    // Clean up whitespace while preserving intentional line breaks
    const lines = cleaned.split('\n');
    const nonEmptyLines = lines
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    return nonEmptyLines.join('\n') || 'No description available.';
} 