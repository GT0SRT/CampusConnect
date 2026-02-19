/**
 * Date utility functions for consistent date handling across the app
 */

/**
 * Safely converts various date formats to JavaScript Date object
 * Handles Firestore timestamps, ISO strings, and Date objects
 * 
 * @param {*} value - Date value (Firestore timestamp, ISO string, or Date)
 * @returns {Date|null} JavaScript Date object or null if invalid
 */
export const toDateSafe = (value) => {
    if (!value) return null;

    // Firestore Timestamp with toDate() method
    if (value?.toDate) return value.toDate();

    // Try to parse as Date
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats a date into a relative time string (e.g., "2h ago", "3 days ago")
 * 
 * @param {*} value - Date value to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (value) => {
    const date = toDateSafe(value);
    if (!date) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffHr < 24) {
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        return `${diffHr}h ago`;
    }

    if (diffDay === 1) return "1 day ago";
    if (diffDay < 7) return `${diffDay} days ago`;

    return date.toLocaleDateString();
};

/**
 * Formats a date into a standard locale date string
 * 
 * @param {*} value - Date value to format
 * @returns {string} Formatted date string
 */
export const formatDate = (value) => {
    const date = toDateSafe(value);
    return date ? date.toLocaleDateString() : "Unknown date";
};

/**
 * Formats a date into a standard locale date and time string
 * 
 * @param {*} value - Date value to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (value) => {
    const date = toDateSafe(value);
    return date ? date.toLocaleString() : "Unknown date";
};
