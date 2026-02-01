// src/i18n.js

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import translationEN from './i18n/locales/en.json'
import translationHI from './i18n/locales/hi.json'
import translationTE from './i18n/locales/te.json'
import translationTA from './i18n/locales/ta.json'
import translationKN from './i18n/locales/kn.json'

// Translation resources
const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    te: { translation: translationTE },
    ta: { translation: translationTA },
    kn: { translation: translationKN },
}

// Get saved language - Force Hindi as default
const savedLanguage = localStorage.getItem('i18nextLng') || 'hi'

// Initialize i18n
i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
        escapeValue: false
    }
})

// Debug
if (import.meta.env.DEV) console.log('🌐 i18n Ready! Language:', i18n.language)

export default i18n
