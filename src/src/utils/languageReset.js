// Utility to reset language to Hindi
export const resetLanguageToHindi = () => {
    localStorage.removeItem('i18nextLng');
    localStorage.setItem('i18nextLng', 'hi');
    window.location.reload();
};

// Reset language to English
export const resetLanguageToEnglish = () => {
    localStorage.removeItem('i18nextLng');
    localStorage.setItem('i18nextLng', 'en');
    window.location.reload();
};

// Set Hindi as default language and English as secondary
export const ensureHindiDefault = () => {
    const currentLang = localStorage.getItem('i18nextLng');
    if (!currentLang) {
        localStorage.setItem('i18nextLng', 'hi'); // Default to Hindi
    }
};

// Set English as secondary language while keeping Hindi as primary
export const setEnglishSecondary = () => {
    const currentLang = localStorage.getItem('i18nextLng');
    if (!currentLang || currentLang === 'hi') {
        // Keep Hindi as primary, but ensure English is available as secondary
        localStorage.setItem('i18nextLng', 'hi');
        localStorage.setItem('i18nextFallbackLng', 'en');
    }
};

// Get current language settings
export const getLanguageSettings = () => {
    return {
        primary: localStorage.getItem('i18nextLng') || 'hi',
        secondary: localStorage.getItem('i18nextFallbackLng') || 'en'
    };
};