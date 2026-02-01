// src/components/home/VideoSection.jsx - AUTO-PLAY FEATURED VIDEO

import { motion } from 'framer-motion';
import { Play, Clock, ArrowRight, Youtube, Video, Eye, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getVideoArticles } from '../../data/newsData';
import VideoPlayerModal from '../common/VideoPlayerModal';
import { parseAndFormatDate } from '../../utils/dateUtils';

const VideoSection = () => {
    const { t, i18n } = useTranslation();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // 🔇 Start muted
    const [isPlaying, setIsPlaying] = useState(false);
    const iframeRef = useRef(null);
    const videoRef = useRef(null);

    // 🎬 Check if YouTube URL
    const isYouTube = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // 🎬 Get YouTube video ID
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

    // 🎬 Get YouTube AUTOPLAY embed URL (muted)
    const getYouTubeAutoPlayUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        // autoplay=1, mute=1 for auto-play muted
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&playsinline=1&controls=0&showinfo=0`;
    };

    // 🎬 Get YouTube embed URL for modal (with controls)
    const getYouTubeEmbedUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    };

    // 🎬 Get thumbnail for non-featured videos
    const getThumbnail = (article) => {
        const videoUrl = article.video;
        if (isYouTube(videoUrl)) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
        }
        if (article.image) {
            if (Array.isArray(article.image)) return article.image[0];
            return article.image;
        }
        return '/IqrarNews.jpeg';
    };

    // 🎬 Open video player modal (with sound)
    const handleVideoClick = (video, e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    // 🎬 Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVideo(null);
    };

    // 🔊 Toggle mute/unmute for featured video
    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);

        // For YouTube iframe, we need to reload with different mute parameter
        // or use YouTube API (complex) - simpler to just open modal with sound
        if (!isMuted) {
            // If unmuting, open in modal for better experience
            if (videos.length > 0) {
                setSelectedVideo(videos[0]);
                setIsModalOpen(true);
            }
        }
    };

    // 🎬 Fetch videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                console.log('🎬 VideoSection: Fetching video articles...');

                const videoArticles = await getVideoArticles();
                console.log('🎬 VideoSection: Found', videoArticles.length, 'video articles');

                setVideos(videoArticles.slice(0, 8));

                // Start playing after videos load
                if (videoArticles.length > 0) {
                    setIsPlaying(true);
                }
            } catch (err) {
                console.error('❌ VideoSection Error:', err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [i18n.language]);

    // Loading state
    if (loading) {
        return (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-gray-700 rounded-xl"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 bg-gray-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hide if no videos
    if (videos.length === 0) {
        return null;
    }

    const featuredVideo = videos[0];
    const otherVideos = videos.slice(1, 5);
    const isYT = isYouTube(featuredVideo.video);
    const autoPlayUrl = isYT ? getYouTubeAutoPlayUrl(featuredVideo.video) : null;

    return (
        <>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                        <span className="bg-red-600 p-2 rounded-lg">
                            <Play size={24} className="fill-white" />
                        </span>
                        {t('home.videoNews') || 'Video News'}
                    </h2>
                    <Link
                        to="/videos"
                        className="text-gray-300 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors"
                    >
                        {t('home.viewAll') || 'View All'}
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* 🎬 Featured Video - AUTO PLAY MUTED */}
                        <div className="lg:col-span-7">
                            <div
                                className="relative rounded-xl overflow-hidden group cursor-pointer"
                                onClick={(e) => handleVideoClick(featuredVideo, e)}
                            >
                                {/* 🔥 Auto-playing YouTube Video (Muted) */}
                                {isYT && autoPlayUrl && isPlaying ? (
                                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                        <iframe
                                            ref={iframeRef}
                                            src={autoPlayUrl}
                                            title={featuredVideo.title}
                                            className="absolute inset-0 w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />

                                        {/* Overlay for click to open modal */}
                                        <div className="absolute inset-0 bg-transparent hover:bg-black/20 transition-colors z-10" />
                                    </div>
                                ) : !isYT && featuredVideo.video ? (
                                    // 🔥 Auto-playing Direct Video (Muted)
                                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                        <video
                                            ref={videoRef}
                                            src={featuredVideo.video}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="absolute inset-0 w-full h-full object-cover"
                                            poster={getThumbnail(featuredVideo)}
                                        />

                                        {/* Overlay for click */}
                                        <div className="absolute inset-0 bg-transparent hover:bg-black/20 transition-colors z-10" />
                                    </div>
                                ) : (
                                    // Fallback: Thumbnail
                                    <div className="relative">
                                        <img
                                            src={getThumbnail(featuredVideo)}
                                            alt={featuredVideo.title}
                                            className="w-full h-[300px] md:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                        {/* Play Button */}
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <Play className="text-white fill-white ml-1" size={36} />
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* 🔊 Mute/Unmute Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleMute}
                                    className="absolute bottom-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                                    title={isMuted ? 'Click to unmute (opens player)' : 'Muted'}
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </motion.button>

                                {/* LIVE Badge */}
                                {/* <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    {isYT ? (
                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                            <Youtube size={14} />
                                            LIVE
                                        </span>
                                    ) : (
                                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Video size={14} />
                                            VIDEO
                                        </span>
                                    )}
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                                        FEATURED
                                    </span>
                                </div> */}

                                {/* Click to Play with Sound hint */}
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center gap-2">
                                        <Play size={12} className="fill-white" />
                                        Click to play with sound
                                    </span>
                                </div>

                                {/* Title Overlay */}
                                <div className="absolute bottom-16 left-0 right-16 p-4 z-10">
                                    <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
                                        {featuredVideo.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-300 text-sm mt-2">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {parseAndFormatDate(featuredVideo.time)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} />
                                            {featuredVideo.views?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🎬 Other Videos (Grid) - Click to Open Modal */}
                        <div className="lg:col-span-5">
                            <div className="grid grid-cols-2 gap-4 h-full">
                                {otherVideos.map((video, index) => (
                                    <motion.div
                                        key={video.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative rounded-lg overflow-hidden group cursor-pointer h-full min-h-[150px]"
                                        onClick={(e) => handleVideoClick(video, e)}
                                    >
                                        <img
                                            src={getThumbnail(video)}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { e.target.src = '/IqrarNews.jpeg'; }}
                                        />

                                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

                                        {/* Play Button */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                                <Play className="text-red-600 group-hover:text-white fill-current ml-0.5" size={20} />
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <div className="absolute top-2 left-2">
                                            {isYouTube(video.video) ? (
                                                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                                                    <Youtube size={10} />
                                                </span>
                                            ) : (
                                                <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                                                    <Video size={10} />
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                            <h4 className="text-white text-xs font-semibold line-clamp-2">
                                                {video.title}
                                            </h4>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Link to="/videos">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Play size={20} className="fill-white" />
                            {t('home.watchMoreVideos') || 'Watch More Videos'}
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            {/* 🎬 Video Player Modal */}
            <VideoPlayerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                video={selectedVideo}
            />
        </>
    );
};

export default VideoSection;