// src/components/article/VideoPlayer.jsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X, Youtube, ExternalLink, AlertCircle } from 'lucide-react';

const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const VideoPlayer = ({ video }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);

    const normalizeVideo = (videoInput) => {
        if (!videoInput) return null;
        if (typeof videoInput === 'object' && videoInput.url) {
            return {
                url: videoInput.url,
                title: stripHtmlTags(videoInput.title || ''),
                thumbnail: videoInput.thumbnail || '',
                caption: stripHtmlTags(videoInput.caption || ''),
                description: stripHtmlTags(videoInput.description || ''),
                excerpt: stripHtmlTags(videoInput.excerpt || '')
            };
        }
        if (typeof videoInput === 'string' && videoInput.trim()) {
            return { url: videoInput.trim(), title: '', thumbnail: '', caption: '', description: '', excerpt: '' };
        }
        return null;
    };

    const normalizedVideo = normalizeVideo(video);
    if (!normalizedVideo || !normalizedVideo.url) return null;

    const getVideoType = (url) => {
        if (!url || typeof url !== 'string') return 'unknown';
        const urlLower = url.toLowerCase();
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
        if (urlLower.includes('vimeo.com')) return 'vimeo';
        if (urlLower.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)) return 'direct';
        if (urlLower.includes('cloudinary.com') || urlLower.includes('s3.amazonaws.com') || 
            urlLower.includes('blob.core.windows.net') || urlLower.includes('storage.googleapis.com') || 
            urlLower.includes('firebasestorage.googleapis.com') || urlLower.includes('res.cloudinary.com')) {
            return 'direct';
        }
        return 'unknown';
    };

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch) return shortMatch[1];
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (watchMatch) return watchMatch[1];
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
        const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
        if (vMatch) return vMatch[1];
        return null;
    };

    const getYouTubeEmbedUrl = (url, autoplay = false) => {
        const videoId = getYouTubeVideoId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1&rel=0' : '?rel=0'}` : '';
    };

    const getYouTubeThumbnail = (url) => {
        const videoId = getYouTubeVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    };

    const getVimeoVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    };

    const getVimeoEmbedUrl = (url, autoplay = false) => {
        const videoId = getVimeoVideoId(url);
        return videoId ? `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}` : '';
    };

    const videoType = getVideoType(normalizedVideo.url);

    const getThumbnail = () => {
        if (normalizedVideo.thumbnail) return normalizedVideo.thumbnail;
        if (videoType === 'youtube') return getYouTubeThumbnail(normalizedVideo.url);
        return null;
    };

    const thumbnailUrl = getThumbnail();
    const displayText = normalizedVideo.caption || normalizedVideo.description || normalizedVideo.excerpt;

    const handleVideoError = () => {
        setHasError(true);
    };

    const renderVideoPlayer = () => {
        switch (videoType) {
            case 'youtube':
                return (
                    <iframe
                        src={getYouTubeEmbedUrl(normalizedVideo.url, true)}
                        title={normalizedVideo.title || 'YouTube Video'}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            case 'vimeo':
                return (
                    <iframe
                        src={getVimeoEmbedUrl(normalizedVideo.url, true)}
                        title={normalizedVideo.title || 'Vimeo Video'}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                );
            case 'direct':
                return (
                    <video
                        src={normalizedVideo.url}
                        controls
                        autoPlay
                        className="absolute top-0 left-0 w-full h-full bg-black"
                        onError={handleVideoError}
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                );
            default:
                return (
                    <iframe
                        src={normalizedVideo.url}
                        title={normalizedVideo.title || 'Video'}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                    />
                );
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="my-8">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                {!isPlaying && !hasError ? (
                    <div className="relative cursor-pointer group" onClick={() => setIsPlaying(true)}>
                        <div className="relative" style={{ paddingBottom: '56.25%' }}>
                            {thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl}
                                    alt={normalizedVideo.title || 'Video thumbnail'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                            )}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/30">
                                    <Play className="text-white fill-white ml-1" size={36} />
                                </motion.div>
                            </div>
                        </div>

                        {/* <div className="absolute top-4 left-4 flex items-center gap-2">
                            {videoType === 'youtube' ? (
                                // <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                //     <Youtube size={14} />
                                //     YouTube
                                // </span>
                            ) : videoType === 'vimeo' ? (
                                <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">Vimeo</span>
                            ) : (
                                <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Play size={14} />
                                    VIDEO
                                </span>
                            )}
                        </div> */}

                        {normalizedVideo.title && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <h4 className="text-white font-bold text-lg drop-shadow-lg">{normalizedVideo.title}</h4>
                            </div>
                        )}
                    </div>
                ) : hasError ? (
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-white p-6">
                            <AlertCircle size={48} className="text-red-500 mb-4" />
                            <p className="text-lg font-semibold mb-2">Video Playback Failed</p>
                            <p className="text-gray-400 text-sm text-center mb-4">The video could not be played.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setHasError(false); setIsPlaying(false); }}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                                <a
                                    href={normalizedVideo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    Open Directly
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        {renderVideoPlayer()}
                        <button
                            onClick={() => { setIsPlaying(false); setHasError(false); }}
                            className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {displayText && (
                    <div className="bg-gray-800 p-4">
                        <div className="flex items-center space-x-2 text-red-500 mb-2">
                            <Play size={16} />
                            <span className="text-sm font-bold uppercase">Video</span>
                        </div>
                        <p className="text-white text-sm">{displayText}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VideoPlayer;