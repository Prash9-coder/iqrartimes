// src/pages/Home.jsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import RightSidebar from '../components/layout/RightSidebar';
import NewsCard from '../components/common/NewsCard';
import { getNonVideoArticles, refreshNewsData } from '../data/newsData';
import { Clock, User, ArrowRight, Newspaper, RefreshCw, Eye, MessageCircle, Calendar } from 'lucide-react';
import VideoSection from '../components/home/VideoSection';
import Loader from '../components/common/Loader';

const Home = () => {
    const { t, i18n } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLang, setCurrentLang] = useState(i18n.language);

    const stripHtmlTags = (html) => {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const formatViews = (views) => {
        if (!views || views === 0) return '0';
        if (views < 1000) return views.toString();
        if (views < 1000000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    };

    // ✅ Convert Hindi to English (numerals + months)
    const convertToEnglish = (str) => {
        if (!str) return '';
        
        let result = str;
        
        // Hindi numerals to English
        const numerals = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
        Object.keys(numerals).forEach(h => {
            result = result.replace(new RegExp(h, 'g'), numerals[h]);
        });
        
        // Hindi months to English
        const months = {
            'जनवरी': 'Jan', 'फ़रवरी': 'Feb', 'फरवरी': 'Feb', 'मार्च': 'Mar',
            'अप्रैल': 'Apr', 'मई': 'May', 'जून': 'Jun', 'जुलाई': 'Jul',
            'अगस्त': 'Aug', 'सितंबर': 'Sep', 'सितम्बर': 'Sep',
            'अक्टूबर': 'Oct', 'अक्तूबर': 'Oct', 'नवंबर': 'Nov', 'नवम्बर': 'Nov',
            'दिसंबर': 'Dec', 'दिसम्बर': 'Dec'
        };
        Object.keys(months).forEach(h => {
            result = result.replace(new RegExp(h, 'g'), months[h]);
        });
        
        return result;
    };

    // ✅ Format date in English ONLY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // If not a valid date, try to convert Hindi to English
                return convertToEnglish(dateString);
            }
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return convertToEnglish(dateString);
        }
    };

    // ✅ Format short date in English ONLY
    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return convertToEnglish(dateString);
            }
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return convertToEnglish(dateString);
        }
    };

    // ✅ Extract TIME only (not date) - Returns time like "10:30 AM" or "2 hr ago"
    const extractTimeOnly = (article) => {
        // Priority 1: If article.time looks like a time (HH:MM format)
        if (article.time && typeof article.time === 'string') {
            const timeMatch = article.time.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)?/i);
            if (timeMatch) {
                return timeMatch[0];
            }
        }

        // Priority 2: Extract time from datetime fields
        const dateFields = [
            article.publishedAt,
            article.published_at,
            article.createdAt,
            article.created_at,
            article.date
        ];

        for (const dateField of dateFields) {
            if (dateField) {
                try {
                    const date = new Date(dateField);
                    if (!isNaN(date.getTime())) {
                        const hours = date.getHours();
                        const minutes = date.getMinutes();
                        
                        // Only return time if it's not midnight (actual time exists)
                        if (hours !== 0 || minutes !== 0) {
                            return date.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            });
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        return '';
    };

    // ✅ Get relative time in English ONLY
    const getRelativeTime = (article) => {
        // Check if relativeTime exists and convert to English
        if (article.relativeTime) {
            return convertRelativeTimeToEnglish(article.relativeTime);
        }
        
        if (article.time && typeof article.time === 'string') {
            // If it contains relative time indicators
            if (article.time.includes('ago') || article.time.includes('पहले')) {
                return convertRelativeTimeToEnglish(article.time);
            }
        }

        // Calculate from date
        const dateFields = [
            article.publishedAt,
            article.published_at,
            article.createdAt,
            article.created_at,
            article.date
        ];

        for (const dateField of dateFields) {
            if (dateField) {
                try {
                    const date = new Date(dateField);
                    if (!isNaN(date.getTime())) {
                        const now = new Date();
                        const diffInSeconds = Math.floor((now - date) / 1000);
                        
                        if (diffInSeconds < 60) return 'Just now';
                        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
                        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
                        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
                        
                        return '';
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        return '';
    };

    // ✅ Convert Hindi relative time to English
    const convertRelativeTimeToEnglish = (hindiTime) => {
        if (!hindiTime) return '';
        
        let result = hindiTime;
        
        // Hindi numerals to English
        const numerals = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
        Object.keys(numerals).forEach(h => {
            result = result.replace(new RegExp(h, 'g'), numerals[h]);
        });
        
        // Hindi words to English
        const translations = {
            'सेकंड पहले': 'sec ago',
            'सेकेंड पहले': 'sec ago',
            'मिनट पहले': 'min ago',
            'घंटे पहले': 'hr ago',
            'घंटा पहले': 'hr ago',
            'दिन पहले': 'days ago',
            'हफ्ते पहले': 'weeks ago',
            'हफ्ता पहले': 'week ago',
            'महीने पहले': 'months ago',
            'महीना पहले': 'month ago',
            'साल पहले': 'years ago',
            'पहले': 'ago',
            'अभी': 'Just now'
        };
        
        Object.keys(translations).forEach(hindi => {
            result = result.replace(new RegExp(hindi, 'g'), translations[hindi]);
        });
        
        return result;
    };

    const fetchData = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            if (forceRefresh) {
                await refreshNewsData();
            }

            const apiData = await getNonVideoArticles();

            const sanitizedArticles = apiData.map((article) => {
                // Get date from multiple possible fields
                const dateValue = article.date || article.publishedAt || article.published_at || article.created_at || article.createdAt;
                
                // Extract time only (like "10:30 AM")
                const timeOnly = extractTimeOnly(article);
                
                // Get relative time (like "2 hr ago")
                const relativeTime = getRelativeTime(article);

                return {
                    ...article,
                    excerpt: stripHtmlTags(article.excerpt || article.description || ''),
                    title: stripHtmlTags(article.title || ''),
                    author: stripHtmlTags(article.author || 'Anonymous'),
                    views: article.views || article.viewsCount || 0,
                    viewsCount: article.viewsCount || article.views || 0,
                    formattedViews: article.formattedViews || formatViews(article.viewsCount || article.views || 0),
                    commentsCount: article.commentsCount || 0,
                    // ✅ Date in English
                    formattedDate: formatDate(dateValue),
                    formattedDateShort: formatDateShort(dateValue),
                    // ✅ Time only (like "10:30 AM")
                    timeOnly: timeOnly,
                    // ✅ Relative time (like "2 hr ago")
                    relativeTime: relativeTime
                };
            });

            setArticles(sanitizedArticles);
        } catch (err) {
            setError(err.message);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (currentLang !== i18n.language) {
            setCurrentLang(i18n.language);
            fetchData(true);
        }
    }, [i18n.language, currentLang]);

    useEffect(() => {
        const handleLanguageChange = () => fetchData(true);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center py-12 px-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {t('notFound.title') || 'Error'}
                    </h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => fetchData(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        {t('notFound.backButton') || 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    const safeArticles = Array.isArray(articles) ? articles : [];

    if (safeArticles.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 px-6 max-w-md"
                >
                    <Newspaper size={48} className="text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {t('notFound.title') || 'No News Found'}
                    </h2>
                    <button
                        onClick={() => fetchData(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent flex items-center justify-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        {t('notFound.backButton') || 'Refresh'}
                    </button>
                </motion.div>
            </div>
        );
    }

    const featuredArticle = safeArticles[0];
    const topStories = safeArticles.slice(1, 5);
    const latestNews = safeArticles.slice(5, 11);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-8 mt-6">

                    {/* ✅ FEATURED ARTICLE - DATE ONCE, ALL ENGLISH */}
                    {featuredArticle && (
                        <Link to={`/article/${featuredArticle.slug}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden mb-6 group cursor-pointer hover:shadow-xl transition-shadow"
                            >
                                <div className="relative h-[400px]">
                                    <img
                                        src={featuredArticle.image}
                                        alt={featuredArticle.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                    {featuredArticle.trending && (
                                        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                            🔥 Trending
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                                        <Eye size={14} />
                                        <span className="font-medium">{featuredArticle.formattedViews}</span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                                            {featuredArticle.title}
                                        </h1>
                                        <p className="text-gray-200 mb-4 line-clamp-2 text-lg">
                                            {featuredArticle.excerpt}
                                        </p>

                                        {/* ✅ FIXED: Meta info - Date only ONCE, all English */}
                                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-300">
                                            {/* Author */}
                                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                <User size={14} />
                                                {featuredArticle.author}
                                            </span>

                                            {/* ✅ Date - Only ONCE */}
                                            {featuredArticle.formattedDate && (
                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                    <Calendar size={14} />
                                                    {featuredArticle.formattedDate}
                                                </span>
                                            )}

                                            {/* ✅ Time - Separate from date */}
                                            {featuredArticle.timeOnly && (
                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                    <Clock size={14} />
                                                    {featuredArticle.timeOnly}
                                                </span>
                                            )}

                                            {/* ✅ OR Relative Time (if no exact time) */}
                                            {!featuredArticle.timeOnly && featuredArticle.relativeTime && (
                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                    <Clock size={14} />
                                                    {featuredArticle.relativeTime}
                                                </span>
                                            )}

                                            {/* Views */}
                                            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                <Eye size={14} />
                                                {featuredArticle.formattedViews} views
                                            </span>

                                            {/* Comments */}
                                            {featuredArticle.commentsCount > 0 && (
                                                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                                                    <MessageCircle size={14} />
                                                    {featuredArticle.commentsCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    )}

                    {/* TOP STORIES */}
                    {topStories.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase mb-4">
                                {t('home.topStories') || 'Top Stories'}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {topStories.map((article, index) => (
                                    <Link key={article.id} to={`/article/${article.slug}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                                        >
                                            <div className="flex">
                                                <div className="w-40 h-32 flex-shrink-0 relative">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                                    />
                                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                        <Eye size={10} />
                                                        {article.formattedViews}
                                                    </div>
                                                </div>
                                                <div className="p-3 flex-1 flex flex-col justify-between">
                                                    <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h3>

                                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                        {/* Date & Time */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {article.formattedDateShort && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={11} className="text-primary" />
                                                                    {article.formattedDateShort}
                                                                </span>
                                                            )}
                                                            {article.timeOnly && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={11} className="text-gray-400" />
                                                                    {article.timeOnly}
                                                                </span>
                                                            )}
                                                            {!article.timeOnly && article.relativeTime && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={11} className="text-gray-400" />
                                                                    {article.relativeTime}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Views & Comments */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-1">
                                                                <Eye size={11} />
                                                                {article.formattedViews}
                                                            </span>
                                                            {article.commentsCount > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <MessageCircle size={11} />
                                                                    {article.commentsCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LATEST NEWS */}
                    {latestNews.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-8">
                                <h2 className="text-2xl font-black uppercase">
                                    {t('home.latestNews') || 'Latest News'}
                                </h2>
                                <div className="flex space-x-4">
                                    <Link
                                        to="/category/दुनिया"
                                        className="text-primary hover:text-accent flex items-center space-x-1 text-sm font-semibold"
                                    >
                                        <span>World News</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/category/विडियोज़"
                                        className="text-primary hover:text-accent flex items-center space-x-1 text-sm font-semibold"
                                    >
                                        <span>Videos</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/category/स्पोर्ट्स"
                                        className="text-primary hover:text-accent flex items-center space-x-1 text-sm font-semibold"
                                    >
                                        <span>Sports</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {latestNews.map((article, index) => (
                                    <NewsCard key={article.id} news={article} index={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4">
                    <div className="sticky top-[150px]">
                        <RightSidebar />
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <VideoSection />
            </div>
        </div>
    );
};

export default Home;