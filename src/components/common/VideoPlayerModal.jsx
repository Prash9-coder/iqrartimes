// src/components/common/VideoPlayerModal.jsx - COMPLETE FIXED VERSION

import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Share2, Clock, Eye, ExternalLink, AlertCircle, Video } from 'lucide-react';
import { useEffect, useCallback, useState } from 'react';
import { parseAndFormatDate } from '../../utils/dateUtils';

const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const VideoPlayerModal = ({ isOpen, onClose, video }) => {
    const [videoError, setVideoError] = useState(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, handleKeyDown]);

    const isYouTube = (url) => {
        if (!url || typeof url !== 'string') return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeVideoId = (url) => {
        if (!url || typeof url !== 'string') return null;

        let videoId = null;
        const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
        if (liveMatch) {
            videoId = liveMatch[1].split('?')[0];
            return videoId;
        }
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) {
            videoId = shortMatch[1].split('?')[0];
            return videoId;
        }
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (watchMatch) {
            videoId = watchMatch[1].split('&')[0];
            return videoId;
        }
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
        if (embedMatch) {
            videoId = embedMatch[1].split('?')[0];
            return videoId;
        }
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) {
            videoId = shortsMatch[1].split('?')[0];
            return videoId;
        }
        const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
        if (vMatch) {
            videoId = vMatch[1].split('?')[0];
            return videoId;
        }
        return null;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    };

    const getImageUrl = (img) => {
        if (!img) return '/IqrarNews.jpeg';
        if (Array.isArray(img) && img.length > 0) return img[0];
        if (typeof img === 'string') return img;
        return '/IqrarNews.jpeg';
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    const handleVideoError = () => {
        setVideoError('Failed to load video');
    };

    const handleShare = async () => {
        const shareUrl = window.location.origin + `/article/${video?.slug}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: stripHtmlTags(video?.title),
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !video) {
        return null;
    }

    const videoUrl = video.video;
    const isYT = isYouTube(videoUrl);
    const embedUrl = isYT ? getYouTubeEmbedUrl(videoUrl) : null;
    const posterImage = getImageUrl(video.image);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[99999] overflow-y-auto"
                    style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
                >
                    <div
                        className="min-h-full flex items-center justify-center p-4 md:p-8"
                        onClick={handleClose}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="fixed top-4 right-4 z-[100000] bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
                            aria-label="Close"
                        >
                            <X size={28} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                                <div className="absolute inset-0">

                                    {!isVideoLoaded && !videoError && embedUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                                                <p className="text-white text-sm">Loading video...</p>
                                            </div>
                                        </div>
                                    )}

                                    {videoError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-20 p-4">
                                            <AlertCircle size={48} className="text-red-500 mb-4" />
                                            <p className="text-lg font-semibold text-center">Video Failed to Load</p>
                                            <p className="text-gray-400 text-sm mt-2 text-center">{videoError}</p>
                                            {videoUrl && (
                                                <a
                                                    href={videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                    <ExternalLink size={18} />
                                                    Open Video Directly
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {isYT && embedUrl && !videoError && (
                                        <iframe
                                            src={embedUrl}
                                            title={stripHtmlTags(video.title) || 'Video'}
                                            className="absolute inset-0 w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            onLoad={handleVideoLoad}
                                        />
                                    )}

                                    {isYT && !embedUrl && !videoError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                                            <Youtube size={64} className="text-red-500 mb-4" />
                                            <p className="text-lg font-semibold mb-2 text-center">YouTube Video</p>
                                            <p className="text-gray-400 text-sm mb-4 text-center">Click below to watch</p>
                                            {/* <a
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <Youtube size={20} />
                                                Watch on YouTube
                                            </a> */}
                                        </div>
                                    )}

                                    {!isYT && videoUrl && !videoError && (
                                        <video
                                            src={videoUrl}
                                            controls
                                            autoPlay
                                            playsInline
                                            className="absolute inset-0 w-full h-full object-contain bg-black"
                                            poster={posterImage}
                                            onLoadedData={handleVideoLoad}
                                            onError={handleVideoError}
                                        >
                                            Your browser does not support video playback.
                                        </video>
                                    )}

                                    {!videoUrl && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                                            <Video size={64} className="text-gray-500 mb-4" />
                                            <p className="text-lg font-semibold text-center">No Video Available</p>
                                            <p className="text-gray-400 text-sm mt-2 text-center">This article doesn't have a video</p>
                                        </div>
                                    )}
                                </div>

                                {isYT && embedUrl && (
                                    <div className="absolute top-4 left-4 z-30 pointer-events-none">
                                      
                                    </div>
                                )}
                            </div>

                            <div className="p-4 md:p-6">
                                <h2 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3 line-clamp-2">
                                    {stripHtmlTags(video.title) || 'Untitled Video'}
                                </h2>

                                {video.excerpt && (
                                    <p className="text-gray-400 text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3">
                                        {stripHtmlTags(video.excerpt)}
                                    </p>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-400 text-xs md:text-sm">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {parseAndFormatDate(video.time) || 'Recent'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} />
                                            {video.views?.toLocaleString() || '0'} views
                                        </span>
                                        {video.author && (
                                            <span className="text-gray-500">
                                                By {stripHtmlTags(video.author)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleShare}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                                        >
                                            <Share2 size={16} />
                                            <span className="hidden sm:inline">Share</span>
                                        </button>

                                        {videoUrl && (
                                            <a
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                                <span className="hidden sm:inline">{isYT ? 'YouTube' : 'Open'}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoPlayerModal;