import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-[104px] min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <motion.h1
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-9xl font-black gradient-text mb-4"
                >
                    404
                </motion.h1>

                <h2 className="text-4xl font-black mb-4">{t('notFound.title')}</h2>

                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    {t('notFound.message')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-accent transition-colors flex items-center space-x-2"
                        >
                            <Home size={20} />
                            <span>{t('notFound.goHome')}</span>
                        </motion.button>
                    </Link>

                    <Link to="/search">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors flex items-center space-x-2"
                        >
                            <Search size={20} />
                            <span>{t('header.search')}</span>
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;