// src/utils/dateUtils.js

/**
 * Format date in English only (regardless of i18n language)
 * @param {string|Date} dateInput - Date string or Date object
 * @param {string} format - 'short', 'medium', 'long', 'relative'
 * @returns {string} - Formatted date in English
 */
export const formatDateEnglish = (dateInput, format = 'medium') => {
    if (!dateInput) return '';
    
    try {
        const date = new Date(dateInput);
        
        // Check if valid date
        if (isNaN(date.getTime())) {
            return dateInput; // Return original if not valid date
        }

        // ✅ Always use English locale
        const locale = 'en-IN';

        switch (format) {
            case 'short':
                // 15 Jan 2025
                return date.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

            case 'medium':
                // January 15, 2025
                return date.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

            case 'long':
                // Wednesday, January 15, 2025
                return date.toLocaleDateString(locale, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

            case 'time':
                // 10:30 AM
                return date.toLocaleTimeString(locale, {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

            case 'datetime':
                // 15 Jan 2025, 10:30 AM
                return date.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }) + ', ' + date.toLocaleTimeString(locale, {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

            case 'relative':
                return getRelativeTimeEnglish(date);

            default:
                return date.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
        }
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateInput || '';
    }
};

/**
 * Get relative time in English (e.g., "2 hours ago", "3 days ago")
 * @param {Date} date - Date object
 * @returns {string} - Relative time string in English
 */
export const getRelativeTimeEnglish = (date) => {
    if (!date) return '';
    
    try {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
        
    } catch (error) {
        return '';
    }
};

/**
 * Parse any date format and return formatted English date
 * Handles: ISO, Hindi dates, timestamps, etc.
 * @param {string} dateString - Any date string
 * @returns {string} - English formatted date
 */
export const parseAndFormatDate = (dateString) => {
    if (!dateString) return '';
    
    // If already looks like English date, return as is
    const englishPattern = /^(\d{1,2}\s)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
    if (englishPattern.test(dateString)) {
        return dateString;
    }
    
    // Try to parse as date
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return formatDateEnglish(date, 'short');
        }
    } catch (e) {
        // Continue to Hindi conversion
    }
    
    // ✅ Convert Hindi months to English (including abbreviated forms with dots)
    const hindiToEnglishMonths = {
        // Full forms first (longest strings match first)
        'जनवरी': 'January',
        'फ़रवरी': 'February',
        'फरवरी': 'February',
        'मार्च': 'March',
        'अप्रैल': 'April',
        'मई': 'May',
        'जून': 'June',
        'जुलाई': 'July',
        'अगस्त': 'August',
        'सितंबर': 'September',
        'सितम्बर': 'September',
        'अक्टूबर': 'October',
        'अक्तूबर': 'October',
        'नवंबर': 'November',
        'नवम्बर': 'November',
        'दिसंबर': 'December',
        'दिसम्बर': 'December',
        // Abbreviated forms with dots
        'जन॰': 'Jan',
        'फ़र॰': 'Feb',
        'फर॰': 'Feb',
        'मार्च॰': 'Mar',
        'अप्र॰': 'Apr',
        'जून॰': 'Jun',
        'जुल॰': 'Jul',
        'अग॰': 'Aug',
        'सित॰': 'Sep',
        'अक्ट॰': 'Oct',
        'अक्त॰': 'Oct',
        'नव॰': 'Nov',
        'दिस॰': 'Dec',
        // Abbreviated forms without dots
        'जन': 'Jan',
        'फ़र': 'Feb',
        'फर': 'Feb',
        'मार्च': 'Mar',
        'अप्र': 'Apr',
        'जुल': 'Jul',
        'अग': 'Aug',
        'सित': 'Sep',
        'अक्ट': 'Oct',
        'अक्त': 'Oct',
        'नव': 'Nov',
        'दिस': 'Dec'
    };
    
    // ✅ Convert Hindi numerals to English
    const hindiToEnglishNumerals = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    
    let result = dateString;
    
    // Replace Hindi months
    Object.keys(hindiToEnglishMonths).forEach(hindi => {
        result = result.replace(new RegExp(hindi, 'g'), hindiToEnglishMonths[hindi]);
    });
    
    // Replace Hindi numerals
    Object.keys(hindiToEnglishNumerals).forEach(hindi => {
        result = result.replace(new RegExp(hindi, 'g'), hindiToEnglishNumerals[hindi]);
    });
    
    return result;
};

/**
 * Parse any date format and return formatted time (12-hour format)
 * @param {string} dateString - Any date string
 * @returns {string} - Formatted time (e.g., "10:30 AM")
 */
export const parseAndFormatTime = (dateString) => {
    if (!dateString) return '';
    
    // Try to parse as date
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return formatDateEnglish(date, 'time');
        }
    } catch (e) {
        // Continue to manual parsing
    }
    
    // If parsing fails, try to extract time from string
    const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/;
    const match = dateString.match(timePattern);
    if (match) {
        let [, hours, minutes, seconds, period] = match;
        let hour = parseInt(hours);
        
        if (period) {
            period = period.toUpperCase();
            if (period === 'PM' && hour < 12) {
                hour += 12;
            } else if (period === 'AM' && hour === 12) {
                hour = 0;
            }
        }
        
        const formattedHours = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const formattedPeriod = hour >= 12 ? 'PM' : 'AM';
        
        return `${formattedHours}:${minutes} ${formattedPeriod}`;
    }
    
    return '';
};

export default {
    formatDateEnglish,
    getRelativeTimeEnglish,
    parseAndFormatDate
};