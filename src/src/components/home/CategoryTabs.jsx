// src/components/home/CategoryTabs.jsx

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import NewsCard from '../common/NewsCard';
import { fetchNewsData, getArticlesByCategory, fetchCategoriesFromApi, clearCategoryCache } from '../../data/newsData';
import Loader from '../common/Loader';

const CategoryTabs = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dynamicCategories, setDynamicCategories] = useState([]);

    // ✅ Fetch categories from API
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const apiCategories = await fetchCategoriesFromApi();
                if (apiCategories && apiCategories.length > 0) {
                    setDynamicCategories(apiCategories);
                    console.log('📂 Loaded', apiCategories.length, 'categories');
                }
            } catch (err) {
                console.warn('⚠️ Failed to load categories');
            }
        };

        loadCategories();
    }, [i18n.language]);

    // ✅ Fetch initial articles
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const allNews = await fetchNewsData('home');
                // Filter out video articles for tabs
                const nonVideoArticles = allNews.filter(a => !a.hasVideo);
                setArticles(nonVideoArticles);
            } catch (err) {
                console.error('Error fetching news data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [i18n.language]);

    // ✅ Handle category tab click
    const handleCategoryClick = async (category) => {
        const categoryName = typeof category === 'object' ? category.name : category;
        const categoryId = typeof category === 'object' ? category.id : null;

        console.log('🔄 Switching to category:', categoryName, categoryId);

        setActiveCategory(category);

        // If "All", show all articles
        if (categoryName === 'All' || categoryName === 'सभी') {
            const allNews = await fetchNewsData('home');
            setArticles(allNews.filter(a => !a.hasVideo));
            return;
        }

        setTabLoading(true);

        try {
            // ✅ Clear cache and fetch fresh data
            clearCategoryCache();

            // Use category ID if available, otherwise use name
            const categoryArticles = await getArticlesByCategory(categoryId || categoryName, true);

            setArticles(categoryArticles);
            console.log('✅ Got', categoryArticles.length, 'articles for:', categoryName);
        } catch (err) {
            console.error('Error fetching category articles:', err);
            setArticles([]);
        } finally {
            setTabLoading(false);
        }
    };

    // ✅ Navigate to full category page
    const handleViewAll = (category) => {
        const categoryId = typeof category === 'object' ? category.id : category;
        navigate(`/category/${categoryId}`);
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <section className="mt-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-3xl font-black mb-6">{t('home.latestNews', 'Latest News')}</h2>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto pb-4 space-x-2 scrollbar-hide">
                    {/* All Tab */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryClick('All')}
                        className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                            activeCategory === 'All'
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border'
                        }`}
                    >
                        {t('categories.all', 'All')}
                    </motion.button>

                    {/* Dynamic Categories */}
                    {dynamicCategories.map((category) => {
                        const isActive = activeCategory === category ||
                            (typeof activeCategory === 'object' && activeCategory.id === category.id);

                        return (
                            <motion.button
                                key={category.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryClick(category)}
                                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                                    isActive
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                            >
                                {category.name}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Loading indicator for tab switch */}
            {tabLoading && (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* News Grid */}
            {!tabLoading && (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {articles.length > 0 ? (
                        articles.slice(0, 9).map((news, index) => (
                            <motion.div
                                key={news.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <NewsCard news={news} index={index} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-500 text-lg">
                                {t('category.noArticles', 'No articles found in this category')}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* View All Button */}
            {!tabLoading && articles.length > 9 && activeCategory !== 'All' && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => handleViewAll(activeCategory)}
                        className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
                    >
                        {t('common.viewAll', 'View All')} →
                    </button>
                </div>
            )}
        </section>
    );
};

export default CategoryTabs;