// src/components/article/ArticleContent.jsx - FIXED: NO VIDEO IN ARTICLES

import { motion } from 'framer-motion';
import { Clock, User, Eye, Calendar, Tag, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InlineImage from './InlineImage';
import ImageGallery from './ImageGallery';

const ArticleContent = ({ article }) => {
    const { t } = useTranslation();

    // ✅ Get author name
    const getAuthorName = () => {
        if (article?.created_by) return article.created_by;
        if (article?.createdBy) return article.createdBy;
        if (article?.reporter) {
            return typeof article.reporter === 'string' ? article.reporter : article.reporter?.name;
        }
        if (article?.author) {
            return typeof article.author === 'string' ? article.author : article.author?.name;
        }
        return 'Staff Reporter';
    };

    const authorName = getAuthorName();

    // ✅ Get first letter for avatar
    const getAuthorInitial = () => {
        if (!authorName || authorName === 'Staff Reporter') return 'S';
        return authorName.charAt(0).toUpperCase();
    };

    // ✅ Generate consistent color based on name
    const getAvatarColor = () => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
            'bg-cyan-500', 'bg-emerald-500'
        ];
        let hash = 0;
        const nameToHash = authorName || 'Staff';
        for (let i = 0; i < nameToHash.length; i++) {
            hash = nameToHash.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // ✅ Get image URL - Clean version without IDs
    const getImageUrl = () => {
        if (Array.isArray(article?.image) && article.image.length > 0) return article.image[0];
        if (typeof article?.image === 'string') return article.image;
        if (article?.featuredImage) {
            return Array.isArray(article.featuredImage) ? article.featuredImage[0] : article.featuredImage;
        }
        if (article?.thumbnail) return article.thumbnail;
        return '/IqrarNews.jpeg';
    };

    // ✅ Get content - use description if content not available
    const getDisplayContent = () => {
        return article?.content || article?.description || '';
    };

    // ✅ Get date
    const getDisplayDate = () => {
        const dateStr = article?.created_at || article?.date || article?.publishedAt || article?.published_at || article?.createdAt;
        if (dateStr) {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
        >
            {/* Featured Image */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={article?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = '/IqrarNews.jpeg';
                        e.target.onerror = null; // Prevent infinite loop
                    }}
                />
                {article?.category && article.category.toLowerCase() !== 'home' && (
                    <span className="absolute top-4 left-4 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase shadow-lg">
                        {typeof article.category === 'string' && !article.category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
                            ? article.category
                            : t('article.general', 'General')}
                    </span>
                )}
            </div>

            {/* ❌ REMOVED: Video Player Section - Videos only show in Video sections */}

            <div className="p-6 md:p-8">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900">
                    {article?.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 md:gap-6 mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar size={18} className="text-primary" />
                        <span className="font-medium">{getDisplayDate()}</span>
                    </div>
                    {article?.readTime && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock size={18} className="text-primary" />
                            <span className="font-medium">{article.readTime}</span>
                        </div>
                    )}
                    {article?.views > 0 && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Eye size={18} className="text-primary" />
                            <span className="font-medium">{article.views?.toLocaleString()} views</span>
                        </div>
                    )}
                    <button className="flex items-center space-x-2 text-primary hover:text-accent transition-colors ml-auto">
                        <Share2 size={18} />
                        <span className="font-semibold">{t('article.share')}</span>
                    </button>
                </div>

                {/* ✅ Author Info */}
                <div className="flex items-center space-x-4 mb-8 pb-8 border-b-2 border-gray-200 bg-gray-50 p-6 rounded-lg">
                    <div className={`w-16 h-16 md:w-20 md:h-20 ${getAvatarColor()} rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg border-4 border-white`}>
                        {getAuthorInitial()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <User size={16} className="text-primary" />
                            <span className="text-sm text-gray-500 uppercase tracking-wide">
                                {t('article.author') || 'Author'}
                            </span>
                        </div>
                        <h3 className="font-black text-lg md:text-xl text-gray-900">
                            {authorName}
                        </h3>
                    </div>
                </div>

                {/* Article Content */}
                <ArticleContentRenderer
                    content={getDisplayContent()}
                    images={article?.images || []}
                />

                {/* Tags */}
                {article?.tags && article.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-8 border-t-2 border-gray-200 bg-gray-50 p-6 rounded-lg">
                        <Tag size={20} className="text-primary" />
                        <span className="font-bold text-gray-700 mr-2">{t('article.tags')}:</span>
                        {article.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.article>
    );
};

// ✅ Article Content Renderer - NO VIDEO SUPPORT
const ArticleContentRenderer = ({ content, images = [] }) => {
    if (!content || !content.trim()) return null;

    const contentParts = content.split(/(\{\{[A-Z_0-9]+\}\})/);

    return (
        <div className="prose prose-lg max-w-none mb-8">
            {contentParts.map((part, index) => {
                if (!part || !part.trim()) return null;

                const imageMatch = part.match(/\{\{IMAGE_(\d+)\}\}/);
                if (imageMatch && images.length > 0) {
                    const imageIndex = parseInt(imageMatch[1]);
                    if (images[imageIndex]) {
                        return <InlineImage key={index} image={images[imageIndex]} />;
                    }
                    return null;
                }

                // ❌ REMOVED: Video matching - no videos in articles
                if (part.match(/\{\{VIDEO_\d+\}\}/)) return null;

                if (part === '{{GALLERY}}' && images.length > 0) {
                    return <ImageGallery key={index} images={images} />;
                }

                if (part.match(/\{\{[A-Z_0-9]+\}\}/)) return null;

                return (
                    <div
                        key={index}
                        style={{
                            lineHeight: '1.8',
                            fontSize: '18px',
                            color: '#374151'
                        }}
                    >
                        {part.replace(/<[^>]*>/g, '')}
                    </div>
                );
            })}
        </div>
    );
};

export default ArticleContent;