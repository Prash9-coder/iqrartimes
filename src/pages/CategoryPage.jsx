// src/pages/CategoryPage.jsx - OPTIMIZED SINGLE API CALL

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { getArticlesByCategory, clearCategoryCache } from '../data/newsData';
import NewsCard from '../components/common/NewsCard';
import RightSidebar from '../components/layout/RightSidebar';
import { Newspaper, RefreshCw, Play, Video } from 'lucide-react';
import Loader from '../components/common/Loader';
import VideoPlayerModal from '../components/common/VideoPlayerModal';
import { parseAndFormatDate } from '../utils/dateUtils';

const CategoryPage = () => {
    const { t, i18n } = useTranslation();
    const { category, subcategory } = useParams();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [isVideosCategory, setIsVideosCategory] = useState(false);

    // ✅ Video Modal State
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const currentLang = i18n.language?.split('-')[0] || 'en';
    const prevLangRef = useRef(currentLang);

    // ✅ Check if category is UUID
    const isUUID = (str) => {
        if (!str) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    // ✅ Check if category is "Videos"
    const checkIfVideosCategory = (name) => {
        if (!name) return false;
        const normalized = name.toLowerCase().trim();
        return normalized === 'videos' ||
            normalized === 'video' ||
            normalized === 'विडियोज़' ||
            normalized === 'वीडियो';
    };

    // ✅ Handle video play
    const handlePlayVideo = (article) => {
        if (article.video && article.video.trim() !== '') {
            setSelectedVideo(article);
            setIsVideoModalOpen(true);
        }
    };

    // ✅ Close video modal
    const handleCloseVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    // ✅ Redirect to home on language change
    useEffect(() => {
        const handleLanguageChange = (newLang) => {
            console.log('🌐 Language changed to:', newLang);
            clearCategoryCache();

            if (category && isUUID(category)) {
                console.log('🔄 On UUID category page - Redirecting to home');
                navigate('/', { replace: true });
            }
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [category, navigate, i18n]);

     // ✅ Fetch articles - SINGLE API CALL
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log('🌟 CategoryPage: Fetching data');
                console.log('   Category:', category);
                console.log('   Language:', currentLang);

                const categoryToFetch = subcategory || category || 'home';

                // ✅ SINGLE API CALL - Backend filters by category_id
                const fetchedArticles = await getArticlesByCategory(categoryToFetch, true);

                console.log('✅ Got', fetchedArticles.length, 'articles');

                // ✅ Set category name from first article or URL param
                if (fetchedArticles.length > 0 && fetchedArticles[0].category) {
                    setCategoryName(fetchedArticles[0].category);
                    setIsVideosCategory(checkIfVideosCategory(fetchedArticles[0].category));
                } else if (category && !isUUID(category)) {
                    // Fallback to URL param ONLY if it's not a UUID
                    const displayName = category.charAt(0).toUpperCase() + category.slice(1);
                    setCategoryName(displayName);
                    setIsVideosCategory(checkIfVideosCategory(category));
                } else if (category && isUUID(category)) {
                    // If category is UUID, fetch category name from API
                    const apiLanguage = currentLang === 'hi' ? 'HINDI' : 'ENGLISH';
                    const categoriesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/news/category?language=${apiLanguage}`);
                    if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();
                        if (categoriesData.success && Array.isArray(categoriesData.data)) {
                            // Find category by ID (including children)
                            const findCategoryById = (cats, id) => {
                                for (let cat of cats) {
                                    if (cat.id === id) {
                                        return cat;
                                    }
                                    if (cat.children && cat.children.length > 0) {
                                        const found = findCategoryById(cat.children, id);
                                        if (found) return found;
                                    }
                                }
                                return null;
                            };
                            const categoryData = findCategoryById(categoriesData.data, category);
                            if (categoryData) {
                                setCategoryName(categoryData.name);
                                setIsVideosCategory(checkIfVideosCategory(categoryData.name));
                            }
                        }
                    }
                }

                // ✅ Check if all articles have videos (Videos category)
                if (fetchedArticles.length > 0) {
                    const allHaveVideos = fetchedArticles.every(a => a.hasVideo);
                    if (allHaveVideos) {
                        setIsVideosCategory(true);
                    }
                }

                setArticles(Array.isArray(fetchedArticles) ? fetchedArticles : []);

            } catch (err) {
                console.error('❌ CategoryPage Error:', err);
                setError(err.message || 'Failed to fetch articles');
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        prevLangRef.current = currentLang;
        fetchData();
    }, [category, subcategory, currentLang]);

    // ✅ Get display name - NEVER show UUIDs to users
    const getCategoryDisplayName = () => {
        if (categoryName) {
            return categoryName;
        }
        if (category && !isUUID(category)) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }
        // If category is a UUID or invalid, show a user-friendly fallback
        return t('header.home', 'Home');
    };

    // ✅ Loading state
    if (loading) {
        return <Loader />;
    }

    // ✅ Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-[140px]">
                <div className="text-center py-8 bg-white rounded-lg shadow-md p-8 max-w-md">
                    <p className="text-red-500 text-xl mb-4">
                        ❌ {t('notFound.title', 'Error')}: {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        {t('notFound.backButton', 'Retry')}
                    </button>
                </div>
            </div>
        );
    }

    const displayCategory = getCategoryDisplayName();
    const showVideoLayout = isVideosCategory;

    return (
        <div className="min-h-screen bg-gray-50 mt-[2px]">
            <div className="max-w-7xl mx-auto px-4 py-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className={showVideoLayout ? "lg:col-span-12 mt-2" : "lg:col-span-8 mt-2"}>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            {/* <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {showVideoLayout ? (
                                        <Video className="text-primary" size={32} />
                                    ) : (
                                        <Newspaper className="text-primary" size={32} />
                                    )}
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-black uppercase">
                                            {displayCategory}
                                        </h1>
                                        <p className="text-gray-600 mt-1">
                                            {articles.length} {showVideoLayout
                                                ? t('category.videos', 'Videos')
                                                : t('category.articles', 'Articles')}
                                        </p>
                                    </div>
                                </div>
                            </div> */}
                        </motion.div>

                        {/* ✅ Video Grid Layout */}
                        {showVideoLayout && articles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {articles.map((article, index) => (
                                    <motion.div
                                        key={article.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                                        onClick={() => handlePlayVideo(article)}
                                    >
                                        {/* Video Thumbnail */}
                                        <div className="relative aspect-video">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                            />

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                                <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                    <Play size={32} className="text-white ml-1" fill="white" />
                                                </div>
                                            </div>

                                            {/* Duration Badge */}
                                            {article.videos?.[0]?.duration && (
                                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                                    {article.videos[0].duration}
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                                <span>{article.author}</span>
                                                <span>{parseAndFormatDate(article.time)}</span>
                                            </div>
                                            {article.views && (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    {article.views.toLocaleString()} views
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* ✅ Regular News Grid Layout */}
                        {!showVideoLayout && articles.length > 0 && (
                            <div className="grid md:grid-cols-2 gap-2">
                                {articles.map((article, index) => (
                                    <motion.div
                                        key={article.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <NewsCard news={article} index={index} />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {articles.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-lg shadow-md p-6 text-center"
                            >
                                {showVideoLayout ? (
                                    <Video size={64} className="mx-auto text-gray-300 mb-4" />
                                ) : (
                                    <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
                                )}
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                                    {showVideoLayout
                                        ? t('category.noVideos', 'No Videos Found')
                                        : t('category.noArticles', 'No Articles Found')}
                                </h3>
                                <p className="text-gray-500 mb-2">
                                    {t('notFound.message', 'No content available in')}{' '}
                                    <strong>{displayCategory}</strong>
                                </p>
                                <p className="text-sm text-gray-400 mb-6">
                                    {t('notFound.lostMessage', 'Please try again later.')}
                                </p>

                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw size={18} />
                                    {t('header.home', 'Go Home')}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar - Hide for Videos category */}
                    {!showVideoLayout && (
                        <div className="lg:col-span-4">
                            <div className="sticky top-[140px]">
                                <RightSidebar />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Video Player Modal */}
            {isVideoModalOpen && selectedVideo && (
                <VideoPlayerModal
                    isOpen={isVideoModalOpen}
                    onClose={handleCloseVideoModal}
                    video={selectedVideo}
                />
            )}
        </div>
    );
};

export default CategoryPage;