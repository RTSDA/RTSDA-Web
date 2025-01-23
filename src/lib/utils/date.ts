/**
 * Formats a date in GMT timezone with medium date style and short time style
 * Example: "Jan 28, 2025 • 7:00 PM"
 */
export function formatDateTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'GMT'
    });
    return formatter.format(date);
}

/**
 * Formats a time in GMT timezone with short time style
 * Example: "7:00 PM"
 */
export function formatTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeStyle: 'short',
        timeZone: 'GMT'
    });
    return formatter.format(date);
}

/**
 * Formats a date range in GMT timezone
 * Example: "Jan 28, 2025 • 7:00 PM - 8:30 PM"
 */
export function formatDateTimeRange(startDate: Date, endDate: Date): string {
    const startDateTime = formatDateTime(startDate);
    const endTime = formatTime(endDate);
    return `${startDateTime} - ${endTime}`;
} 