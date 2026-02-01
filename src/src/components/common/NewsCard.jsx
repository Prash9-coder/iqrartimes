import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, User, Video, Eye, MessageCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stripHtmlTags } from '../../utils/textHelpers';
import { parseAndFormatDate, parseAndFormatTime } from '../../utils/dateUtils';

const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

const formatDateShort = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
};

const NewsCard = ({ news, index }) => {
    const { t } = useTranslation();

    const authorName = stripHtmlTags(
        typeof news.author === 'string' ? news.author : news.author?.name || 'Unknown'
    );

    // Removed relative time field as requested

    const displayViews = news.formattedViews ||
        (news.viewsCount ? formatNumber(news.viewsCount) :
            (news.views ? formatNumber(news.views) : '0'));

    const displayComments = news.commentsCount || 0;

    const displayDate = news.formattedDateShort ||
        formatDateShort(news.date || news.publishedAt || news.created_at);
    
    const displayTime = news.timeOnly || parseAndFormatTime(news.time || news.date || news.publishedAt || news.published_at || news.created_at);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
        >
            <Link to={`/article/${news.slug}`}>
                <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                        src={news.image}
                        alt={stripHtmlTags(news.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = '/IqrarNews.jpeg';
                            e.target.onerror = null;
                        }}
                    />

                    {news.video && (
                        <span className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 shadow-lg">
                            <Video size={12} />
                            <span>Video</span>
                        </span>
                    )}

                    {news.trending && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 shadow-lg">
                            🔥 Trending
                        </span>
                    )}

                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{displayViews}</span>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {stripHtmlTags(news.title)}
                    </h3>

                    {news.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {stripHtmlTags(news.excerpt)}
                        </p>
                    )}

                    <div className="flex flex-col gap-2 text-xs text-gray-500 pt-3 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                                <User size={14} />
                                <span className="truncate max-w-[100px]">{authorName}</span>
                            </div>

                            {displayDate && (
                                <div className="flex items-center space-x-1">
                                    <Calendar size={14} className="text-primary" />
                                    <span>{displayDate}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                    <Eye size={14} className="text-gray-400" />
                                    <span>{displayViews}</span>
                                </div>

                                {displayComments > 0 && (
                                    <div className="flex items-center space-x-1">
                                        <MessageCircle size={14} className="text-gray-400" />
                                        <span>{displayComments}</span>
                                    </div>
                                )}
                            </div>

                            {displayTime && (
                                <div className="flex items-center space-x-1">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>{displayTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
};

export default NewsCard;