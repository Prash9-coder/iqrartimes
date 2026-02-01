// src/components/layout/RightSidebar.jsx - COMPLETE WORKING VERSION

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, Clock, Eye, Play, Youtube, Video, ArrowRight, X, Share2, ExternalLink, AlertCircle } from 'lucide-react';
import { getTrendingArticles, getVideoArticles } from '../../data/newsData';
import { parseAndFormatDate, parseAndFormatTime } from '../../utils/dateUtils';

// ═══════════════════════════════════════════════════════════════
// 🎬 VIDEO MODAL COMPONENT - FULL IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════
const VideoModal = ({ isOpen, onClose, video }) => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(null);

    // Handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            setVideoError(null);
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

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    // 🎬 Check if YouTube
    const isYouTube = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // 🎬 Get YouTube Video ID - Handles ALL formats
    const getYouTubeVideoId = (url) => {
        if (!url || typeof url !== 'string') return null;

        // youtube.com/live/VIDEO_ID
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) return liveMatch[1].split('?')[0];

        // youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return shortMatch[1].split('?')[0];

        // youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (watchMatch) return watchMatch[1].split('&')[0];

        // youtube.com/embed/VIDEO_ID
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
        if (embedMatch) return embedMatch[1].split('?')[0];

        // youtube.com/shorts/VIDEO_ID
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return shortsMatch[1].split('?')[0];

        return null;
    };

    // 🎬 Get YouTube embed URL
    const getYouTubeEmbedUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    };

    // 🎬 Get image URL (handles array or string)
    const getImageUrl = (img) => {
        if (!img) return '/IqrarNews.jpeg';
        if (Array.isArray(img) && img.length > 0) return img[0];
        if (typeof img === 'string') return img;
        return '/IqrarNews.jpeg';
    };

    // 🎬 Share video
    const handleShare = async () => {
        const shareUrl = window.location.origin + `/article/${video?.slug}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: video?.title, url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    // Don't render if not open or no video
    if (!isOpen || !video) return null;

    const videoUrl = video.video;
    const isYT = isYouTube(videoUrl);
    const embedUrl = isYT ? getYouTubeEmbedUrl(videoUrl) : null;
    const posterImage = getImageUrl(video.image);

    // 🔥 Use createPortal to render at document.body level
    return createPortal(
        <div
            className="fixed inset-0 overflow-y-auto"
            style={{
                zIndex: 999999,
                backgroundColor: 'rgba(0,0,0,0.95)'
            }}
        >
            <div
                className="min-h-full flex items-center justify-center p-4 md:p-8"
                onClick={onClose}
            >
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="fixed top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                    style={{ zIndex: 1000000 }}
                    aria-label="Close"
                >
                    <X size={28} />
                </button>

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Video Player - 16:9 Aspect Ratio */}
                    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                        <div className="absolute inset-0">

                            {/* Loading */}
                            {!isVideoLoaded && !videoError && embedUrl && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                                        <p className="text-white text-sm">Loading video...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {videoError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-20 p-4">
                                    <AlertCircle size={48} className="text-red-500 mb-4" />
                                    <p className="text-lg font-semibold text-center">Video Failed to Load</p>
                                    {videoUrl && (
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                                        >
                                            <ExternalLink size={18} />
                                            Open Video Directly
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* YouTube Embed */}
                            {isYT && embedUrl && !videoError && (
                                <iframe
                                    src={embedUrl}
                                    title={video.title || 'Video'}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    onLoad={() => setIsVideoLoaded(true)}
                                />
                            )}

                            {/* YouTube but no embed URL */}
                            {isYT && !embedUrl && !videoError && (
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

                            {/* Direct Video (MP4, etc) */}
                            {!isYT && videoUrl && !videoError && (
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-contain bg-black"
                                    poster={posterImage}
                                    onLoadedData={() => setIsVideoLoaded(true)}
                                    onError={() => setVideoError('Failed to load video')}
                                >
                                    Your browser does not support video.
                                </video>
                            )}

                            {/* No Video URL */}
                            {!videoUrl && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                                    <Video size={64} className="text-gray-500 mb-4" />
                                    <p className="text-lg font-semibold">No Video Available</p>
                                </div>
                            )}
                        </div>

                        {/* YouTube Badge */}
                        {isYT && embedUrl && (
                            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                                {/* <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    
                                </span> */}
                            </div>
                        )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold text-white mb-2 line-clamp-2">
                            {video.title || 'Untitled Video'}
                        </h2>

                        {video.excerpt && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {video.excerpt}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs md:text-sm">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {parseAndFormatDate(video.time) || 'Recent'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {video.views?.toLocaleString() || '0'}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShare}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                                >
                                    <Share2 size={16} />
                                    Share
                                </button>

                                {videoUrl && (
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
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

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN RIGHTSIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════════
const RightSidebar = () => {
    const { t, i18n } = useTranslation();
    const [trending, setTrending] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🎬 YouTube helpers
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

        return null;
    };

    const getThumbnail = (article) => {
        const videoUrl = article.video;
        if (isYouTube(videoUrl)) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        if (article.image) {
            if (Array.isArray(article.image)) return article.image[0];
            return article.image;
        }
        return '/IqrarNews.jpeg';
    };

    // 🎬 Open video modal
    const handleVideoClick = (video, e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎬 RightSidebar: Opening video:', video.title);
        console.log('🎬 Video URL:', video.video);
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    // 🎬 Close modal
    const handleCloseModal = () => {
        console.log('🎬 RightSidebar: Closing modal');
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    // 📊 Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('📊 RightSidebar: Fetching data...');

                const trendingData = await getTrendingArticles();
                setTrending(Array.isArray(trendingData) ? trendingData.slice(0, 5) : []);

                const videoData = await getVideoArticles();
                setVideos(Array.isArray(videoData) ? videoData.slice(0, 4) : []);

                console.log('✅ RightSidebar: Trending:', trendingData?.length || 0);
                console.log('🎬 RightSidebar: Videos:', videoData?.length || 0);
            } catch (err) {
                console.error('❌ RightSidebar Error:', err);
                setTrending([]);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [i18n.language]);

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 mt-16">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* 📈 Trending News Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
                        <TrendingUp className="text-primary" size={20} />
                        <h2 className="text-lg font-black uppercase">
                            {t('home.trending') || 'Trending'}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {trending.length > 0 ? (
                            trending.map((article, index) => (
                                <Link key={article.id || index} to={`/article/${article.slug}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex space-x-3 group cursor-pointer pb-4 border-b last:border-0 last:pb-0"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock size={12} className="mr-1" />
                                                    {parseAndFormatDate(article.time) || 'Recent'}
                                                </span>
                                                <span className="flex items-center">
                                                    <Eye size={12} className="mr-1" />
                                                    {article.views || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <TrendingUp size={32} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">No trending articles</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🎬 Latest Videos Section */}
                {videos.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                                <div className="bg-red-600 p-1.5 rounded">
                                    <Play className="text-white fill-white" size={16} />
                                </div>
                                <h2 className="text-lg font-black uppercase text-white">
                                    {t('home.latestVideos') || 'Latest Videos'}
                                </h2>
                            </div>
                            <Link to="/videos" className="text-gray-400 hover:text-white transition-colors">
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {videos.map((video, index) => {
                                const isYT = isYouTube(video.video);
                                const thumbnail = getThumbnail(video);

                                return (
                                    <motion.div
                                        key={video.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="group cursor-pointer"
                                        onClick={(e) => handleVideoClick(video, e)}
                                    >
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src={thumbnail}
                                                alt={video.title}
                                                className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                            />

                                            {/* Overlay with Play Button */}
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                                    <Play className="text-white fill-white ml-0.5" size={16} />
                                                </div>
                                            </div>

                                            {/* Video Type Badge */}
                                            <div className="absolute top-2 left-2">
                                                {isYT ? (
                                                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                                                        <Youtube size={10} />
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                        <Video size={10} />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Time Badge */}
                                            <div className="absolute bottom-2 right-2">
                                                <span className="bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px]">
                                                    {parseAndFormatDate(video.time) || 'New'}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors line-clamp-2 mt-2">
                                            {video.title}
                                        </h3>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* View All Button */}
                        <Link to="/videos">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-4 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Play size={14} />
                                {t('home.viewAllVideos') || 'View All Videos'}
                            </motion.button>
                        </Link>
                    </div>
                )}
            </div>

            {/* 🎬 Video Modal - Rendered via Portal */}
            <VideoModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                video={selectedVideo}
            />
        </>
    );
};

export default RightSidebar;
