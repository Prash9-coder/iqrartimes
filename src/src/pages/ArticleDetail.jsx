// src/pages/ArticleDetail.jsx - WITH VIEWS COUNT

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getArticleBySlug, getRelatedArticles } from '../data/newsData';
import ShareButtons from '../components/article/ShareButtons';
import RelatedArticles from '../components/article/RelatedArticles';
import RightSidebar from '../components/layout/RightSidebar';
import Loader from '../components/common/Loader';
import { ArrowLeft, Home, Clock, Tag, Calendar, Eye, MessageCircle, User, TrendingUp } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// 🧹 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

// ✅ Check if value looks like an ID (UUID, MongoDB ID, etc.)
const isIdLike = (value) => {
    if (!value || typeof value !== 'string') return true;
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const mongoIdPattern = /^[0-9a-f]{24}$/i;
    const numericIdPattern = /^\d+$/;
    const hashPattern = /^[a-zA-Z0-9]{20,}$/;
    
    return uuidPattern.test(value) || 
           mongoIdPattern.test(value) || 
           numericIdPattern.test(value) ||
           hashPattern.test(value);
};

// ✅ Format date properly
const formatDate = (dateValue) => {
    if (!dateValue) return null;
    if (isIdLike(dateValue)) return null;
    
    if (typeof dateValue === 'string' && dateValue.includes(' ')) {
        return dateValue;
    }
    
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return null;
    }
};

// ✅ Format time properly
const formatTime = (timeValue) => {
    if (!timeValue) return null;
    if (isIdLike(timeValue)) return null;
    
    if (typeof timeValue === 'string' && 
        (timeValue.includes('ago') || timeValue.includes('hour') || 
         timeValue.includes('min') || timeValue.includes('day') ||
         timeValue.includes('पहले') || timeValue.includes('घंटे') ||
         timeValue.includes('मिनट') || timeValue.includes('दिन'))) {
        return timeValue;
    }
    
    if (typeof timeValue === 'string' && timeValue.includes(':')) {
        return timeValue;
    }
    
    return null;
};

// ✅ Get clean category name
const getCleanCategory = (category) => {
    if (!category) return null;
    
    if (typeof category === 'object' && category.name) {
        return category.name;
    }
    
    if (typeof category === 'string' && isIdLike(category)) {
        return null;
    }
    
    return category;
};

// ✅ Format views count - 4471 → "4.5K"
const formatViews = (views) => {
    if (!views || views === 0) return '0';
    if (views < 1000) return views.toString();
    if (views < 1000000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

const ArticleDetail = () => {
    const { t, i18n } = useTranslation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setNotFound(false);

            try {
                const fetchedArticle = await getArticleBySlug(slug);

                if (!fetchedArticle) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const related = await getRelatedArticles(
                    fetchedArticle.id,
                    fetchedArticle.category,
                    3
                );

                setArticle(fetchedArticle);
                setRelatedArticles(related);
                setLoading(false);

            } catch (err) {
                console.error('❌ ArticleDetail: Error:', err);
                setError(err.message || 'Failed to load article');
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, i18n.language]);

    // ✅ Loading State
    if (loading) {
        return <Loader />;
    }

    // ✅ Error State
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center py-12 px-6 max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {t('notFound.title') || 'Error'}
                    </h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            {t('notFound.backButton') || 'Go Back'}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Not Found State
    if (notFound || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center py-12 px-6 max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-6xl">📰</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        {t('notFound.title') || 'Article Not Found'}
                    </h2>

                    <p className="text-gray-500 mb-2">
                        {t('notFound.message') || 'The article you are looking for does not exist.'}
                    </p>

                    <p className="text-gray-400 text-sm mb-8">
                        {t('notFound.lostMessage') || 'It may have been removed or the link is incorrect.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            {t('notFound.backButton') || 'Go Back'}
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent flex items-center justify-center gap-2"
                        >
                            <Home size={18} />
                            {t('notFound.goHome') || 'Go Home'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ CLEAN DATA - Remove any ID-like values
    // ═══════════════════════════════════════════════════════════════
    const cleanCategory = getCleanCategory(article.category);
    const cleanDate = formatDate(article.date || article.createdAt || article.created_at);
    // Removed relative time field as requested
    // const cleanTime = formatTime(article.relativeTime || article.time);
    const cleanAuthor = article.author && !isIdLike(article.author) ? stripHtmlTags(article.author) : null;
    const cleanTags = Array.isArray(article.tags) 
        ? article.tags.filter(tag => !isIdLike(tag)).map(tag => stripHtmlTags(tag))
        : [];

    // ✅ Get views and comments
    const viewsCount = article.viewsCount || article.views || 0;
    const formattedViews = article.formattedViews || formatViews(viewsCount);
    const commentsCount = article.commentsCount || 0;
    const isTrending = article.trending || article.is_trending || false;

    return (
        <div className="mt-[30px] min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content - 8 columns */}
                    <div className="lg:col-span-8">
                        
                        {/* ✅ ARTICLE CARD */}
                        <article className="bg-white rounded-xl shadow-lg overflow-hidden">

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 1️⃣ CATEGORY & TRENDING BADGE */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            <div className="px-6 pt-6 flex items-center gap-3 flex-wrap">
                                {cleanCategory && (
                                    <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {cleanCategory}
                                    </span>
                                )}
                                
                                {/* ✅ Trending Badge */}
                                {isTrending && (
                                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        <TrendingUp size={12} />
                                        Trending
                                    </span>
                                )}
                            </div>

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 2️⃣ TITLE */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            <div className="px-6 pt-4 pb-4">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                                    {stripHtmlTags(article.title)}
                                </h1>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* ✅ STATS BAR - Views, Comments, Date, Time */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                    
                                    {/* ✅ Views Count */}
                                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                                        <Eye size={16} />
                                        <span className="font-semibold">{formattedViews}</span>
                                        <span className="text-blue-400">views</span>
                                    </span>
                                    
                                    {/* ✅ Comments Count */}
                                    {commentsCount > 0 && (
                                        <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
                                            <MessageCircle size={16} />
                                            <span className="font-semibold">{commentsCount}</span>
                                            <span className="text-green-400">comments</span>
                                        </span>
                                    )}
                                    
                                    {/* ✅ Date */}
                                    {cleanDate && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>{cleanDate}</span>
                                        </span>
                                    )}
                                    
                                    {/* ✅ Time */}
                                    {article.timeOnly && (
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-gray-400" />
                                            <span>{article.timeOnly}</span>
                                        </span>
                                    )}
                                    

                                </div>
                            </div>

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 3️⃣ IMAGE */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {article.image && (
                                <div className="px-6">
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={article.image}
                                            alt={stripHtmlTags(article.title)}
                                            className="w-full h-auto max-h-[500px] object-cover"
                                            onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                        />
                                        
                                        {/* ✅ Views Badge on Image */}
                                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                                            <Eye size={14} />
                                            <span className="font-medium">{formattedViews}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 4️⃣ VIDEO */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {article.video && (
                                <div className="px-6 mt-4">
                                    <div className="relative rounded-xl overflow-hidden bg-black">
                                        <video
                                            src={article.video}
                                            controls
                                            className="w-full max-h-[500px]"
                                            poster={article.image}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 5️⃣ CONTENT */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            <div className="px-6 py-6">
                                <div 
                                    className="prose prose-lg max-w-none 
                                        prose-headings:font-bold prose-headings:text-gray-900
                                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                        prose-img:rounded-lg prose-img:shadow-md
                                        prose-strong:text-gray-900
                                        prose-ul:list-disc prose-ol:list-decimal
                                        prose-li:text-gray-700"
                                    dangerouslySetInnerHTML={{ 
                                        __html: article.description || article.content || '' 
                                    }}
                                />
                            </div>

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 6️⃣ TAGS */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {cleanTags.length > 0 && (
                                <div className="px-6 pb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag size={16} className="text-gray-400" />
                                        {cleanTags.map((tag, index) => (
                                            <span 
                                                key={index}
                                                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 7️⃣ ARTICLE STATS BAR (Bottom) */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    {/* Left - Views & Comments */}
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Eye size={18} className="text-blue-500" />
                                            <span><strong>{formattedViews}</strong> views</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={18} className="text-green-500" />
                                            <span><strong>{commentsCount}</strong> comments</span>
                                        </div>
                                    </div>
                                    

                                </div>
                            </div>

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* 8️⃣ AUTHOR */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {cleanAuthor && (
                                <div className="px-6 pb-6">
                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex items-center gap-4">
                                            {/* Author Avatar */}
                                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {cleanAuthor.charAt(0).toUpperCase()}
                                            </div>
                                            
                                            {/* Author Info */}
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                    {t('article.writtenBy') || 'Written By'}
                                                </p>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {cleanAuthor}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {t('article.reporter') || 'News Reporter'}
                                                </p>
                                            </div>
                                            
                                            {/* Author Stats */}
                                            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                                                <div className="text-center">
                                                    <div className="font-bold text-gray-800">{formattedViews}</div>
                                                    <div className="text-xs">Views</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="mt-8">
                                <RelatedArticles articles={relatedArticles} />
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - 4 columns */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[150px] space-y-6">
                            <ShareButtons article={article} />
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetail;