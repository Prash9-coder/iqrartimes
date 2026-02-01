import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { refreshNewsData } from '../../data/newsData';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = async (code) => {
        if (code === i18n.language) {
            setIsOpen(false);
            return;
        }

        setIsChanging(true);

        try {
            // Change i18n language
            await i18n.changeLanguage(code);

            // Save to localStorage
            localStorage.setItem('i18nextLng', code);

            if (import.meta.env.DEV) console.log('✅ Language changed to:', code);
            if (import.meta.env.DEV) console.log('🔄 Refreshing news data...');

            // Reload page to fetch new language data
            window.location.reload();
        } catch (error) {
            console.error('Error changing language:', error);
            setIsChanging(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isChanging}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
                <Globe size={18} className={isChanging ? 'animate-spin' : ''} />
                <span className="text-sm font-semibold">
                    {isChanging ? 'Loading...' : currentLanguage.nativeName}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[9999]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-[10000] overflow-hidden"
                        >
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => changeLanguage(language.code)}
                                    disabled={isChanging}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between disabled:opacity-50 ${i18n.language === language.code ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    <div>
                                        <div className="font-semibold text-sm">{language.nativeName}</div>
                                        <div className="text-xs text-gray-500">{language.name}</div>
                                    </div>
                                    {i18n.language === language.code && (
                                        <Check size={16} className="text-primary" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;