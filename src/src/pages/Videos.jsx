// src/pages/Videos.jsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Play, Clock, Eye, X, Youtube, Video, RefreshCw, Share2, ExternalLink, AlertCircle } from 'lucide-react';
import RightSidebar from '../components/layout/RightSidebar';
import { getVideoArticles } from '../data/newsData';
import { parseAndFormatDate, formatDateEnglish } from '../utils/dateUtils'; // ✅ Import

const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const VideoModal = ({ isOpen, onClose, video }) => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            setIsVideoLoaded(false);

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    const isYouTube = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) return liveMatch[1].split('?')[0];
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return shortMatch[1].split('?')[0];
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (watchMatch) return watchMatch[1].split('&')[0];
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
        if (embedMatch) return embedMatch[1].split('?')[0];
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return shortsMatch[1].split('?')[0];
        return null;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : null;
    };

    const getImageUrl = (img) => {
        if (!img) return '/IqrarNews.jpeg';
        return Array.isArray(img) ? img[0] : img;
    };

    const handleShare = async () => {
        const shareUrl = window.location.origin + `/article/${video?.slug}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: stripHtmlTags(video?.title), url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied!');
            }
        } catch (err) { }
    };

    // ✅ Format time in English
    const getFormattedTime = (timeString) => {
        if (!timeString) return 'Recent';
        return parseAndFormatDate(timeString);
    };

    if (!isOpen || !video) return null;

    const videoUrl = video.video;
    const isYT = isYouTube(videoUrl);
    const embedUrl = isYT ? getYouTubeEmbedUrl(videoUrl) : null;
    const posterImage = getImageUrl(video.image);
    const descriptionText = stripHtmlTags(video.excerpt || video.description || video.content || '');

    return createPortal(
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.95)' }}>
            <div className="min-h-full flex items-center justify-center p-4 md:p-8" onClick={onClose}>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="fixed top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                    style={{ zIndex: 1000000 }}
                >
                    <X size={28} />
                </button>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                        <div className="absolute inset-0">
                            {!isVideoLoaded && embedUrl && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                                </div>
                            )}

                            {isYT && embedUrl && (
                                <iframe
                                    src={embedUrl}
                                    title={stripHtmlTags(video.title)}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onLoad={() => setIsVideoLoaded(true)}
                                />
                            )}

                            {isYT && !embedUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                                    <Youtube size={64} className="text-red-500 mb-4" />
                                    <p className="text-lg font-semibold mb-4">YouTube Video</p>
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                                    >
                                        <Youtube size={20} />
                                        Watch on YouTube
                                    </a>
                                </div>
                            )}

                            {!isYT && videoUrl && (
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-contain bg-black"
                                    poster={posterImage}
                                    onLoadedData={() => setIsVideoLoaded(true)}
                                />
                            )}

                            {!videoUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                                    <Video size={64} className="text-gray-500 mb-4" />
                                    <p className="text-lg font-semibold">No Video Available</p>
                                </div>
                            )}
                        </div>

                        {isYT && embedUrl && (
                            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Youtube size={16} />
                                    YouTube
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold text-white mb-2 line-clamp-2">
                            {stripHtmlTags(video.title)}
                        </h2>

                        {descriptionText && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {descriptionText}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs md:text-sm">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {/* ✅ FIXED: English date */}
                                    {getFormattedTime(video.time || video.date || video.publishedAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {video.views?.toLocaleString() || '0'}
                                </span>
                                {video.category && (
                                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                                        {stripHtmlTags(video.category)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShare}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                                >
                                    <Share2 size={16} />
                                    Share
                                </button>

                                {videoUrl && (
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        {isYT ? 'YouTube' : 'Open'}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>,
        document.body
    );
};

const Videos = () => {
    const { t, i18n } = useTranslation();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isYouTube = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) return liveMatch[1].split('?')[0];
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return shortMatch[1].split('?')[0];
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (watchMatch) return watchMatch[1].split('&')[0];
        return null;
    };

    const getThumbnail = (article) => {
        const videoUrl = article.video;
        if (isYouTube(videoUrl)) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        if (article.image) {
            return Array.isArray(article.image) ? article.image[0] : article.image;
        }
        return '/IqrarNews.jpeg';
    };

    const getDescription = (article) => {
        return stripHtmlTags(article.excerpt || article.description || article.content || '');
    };

    // ✅ Format time in English
    const getFormattedTime = (article) => {
        const timeValue = article.time || article.date || article.publishedAt || article.createdAt;
        if (!timeValue) return 'Recent';
        return parseAndFormatDate(timeValue);
    };

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const videoArticles = await getVideoArticles();
            setVideos(Array.isArray(videoArticles) ? videoArticles : []);
        } catch (err) {
            console.error('Videos Page Error:', err);
            setError('Failed to load videos');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [i18n.language]);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 mt-[30px]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <RefreshCw size={48} className="animate-spin text-primary mx-auto mb-4" />
                            <p className="text-gray-500">Loading videos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 mt-[30px]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={fetchVideos}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={18} />
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 mt-[30px]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Video size={64} className="text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Videos Found</h2>
                            <p className="text-gray-500 mb-4">No video content available at the moment</p>
                            <button
                                onClick={fetchVideos}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const featuredVideo = videos[0];
    const otherVideos = videos.slice(1);

    return (
        <div className="min-h-screen bg-gray-50 mt-[30px]">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-black uppercase flex items-center">
                                <Play className="text-primary mr-3" size={32} />
                                {t('videos.title') || 'Videos'}
                            </h1>
                            <p className="text-gray-600">{t('videos.subtitle') || 'Watch latest news videos'}</p>
                            <p className="text-sm text-gray-400 mt-1">{videos.length} videos available</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                            <div className="relative group cursor-pointer" onClick={() => handleVideoClick(featuredVideo)}>
                                <img
                                    src={getThumbnail(featuredVideo)}
                                    alt={stripHtmlTags(featuredVideo.title)}
                                    className="w-full h-[350px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                    <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                        <Play className="text-white fill-white ml-1" size={36} />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="p-6">
                                <span className="text-primary text-sm font-bold uppercase">
                                    {stripHtmlTags(featuredVideo.category) || 'Video'}
                                </span>
                                <h2 className="text-xl md:text-2xl font-black mt-2 mb-3 line-clamp-2">
                                    {stripHtmlTags(featuredVideo.title)}
                                </h2>
                                {getDescription(featuredVideo) && (
                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {getDescription(featuredVideo)}
                                    </p>
                                )}
                                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                    <span className="flex items-center">
                                        <Eye size={16} className="mr-1" />
                                        {featuredVideo.views?.toLocaleString() || '0'} views
                                    </span>
                                    <span className="flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        {/* ✅ FIXED: English date */}
                                        {getFormattedTime(featuredVideo)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {otherVideos.length > 0 && (
                            <>
                                <h2 className="text-xl font-black uppercase mb-4">{t('videos.moreVideos') || 'More Videos'}</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {otherVideos.map((video, index) => (
                                        <motion.div
                                            key={video.id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleVideoClick(video)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={getThumbnail(video)}
                                                    alt={stripHtmlTags(video.title)}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                                                        <Play className="text-white fill-white ml-1" size={24} />
                                                    </div>
                                                </div>
                                                {isYouTube(video.video) && (
                                                    <div className="absolute top-2 left-2">
                                                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                                                            <Youtube size={10} />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <span className="text-primary text-xs font-bold uppercase">
                                                    {stripHtmlTags(video.category) || 'Video'}
                                                </span>
                                                <h3 className="font-bold mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {stripHtmlTags(video.title)}
                                                </h3>
                                                {getDescription(video) && (
                                                    <p className="text-gray-500 text-xs mb-2 line-clamp-1">
                                                        {getDescription(video)}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-3 text-gray-500 text-xs">
                                                    <span className="flex items-center">
                                                        <Eye size={12} className="mr-1" />
                                                        {video.views?.toLocaleString() || '0'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        {/* ✅ FIXED: English date */}
                                                        {getFormattedTime(video)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-[150px]">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>

            <VideoModal isOpen={isModalOpen} onClose={handleCloseModal} video={selectedVideo} />
        </div>
    );
};

export default Videos;