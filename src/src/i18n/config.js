// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationHI from './locales/hi.json';
import translationTE from './locales/te.json';
import translationTA from './locales/ta.json';
import translationKN from './locales/kn.json';

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    te: { translation: translationTE },
    ta: { translation: translationTA },
    kn: { translation: translationKN },
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'hi';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    });

if (import.meta.env.DEV) console.log('🌐 i18n initialized with language:', i18n.language);

export default i18n;  // ✅ FIXED: i18n export cheyyali, config kaadu!