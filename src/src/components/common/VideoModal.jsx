// src/components/VideoModal.jsx

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const VideoModal = ({ isOpen, onClose, video }) => {
    if (!video) return null;

    const getEmbedUrl = (url) => {
        if (!url) return '';
        
        // YouTube
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        }
        if (url.includes('youtu.be')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        }
        return url;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
                        onClick={onClose}
                    >
                        <X size={32} />
                    </button>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={getEmbedUrl(video.url)}
                                title={stripHtmlTags(video.title)}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div className="bg-gray-900 p-4 rounded-b-lg">
                            <h3 className="text-white text-xl font-bold">
                                {stripHtmlTags(video.title)}
                            </h3>
                            {video.caption && (
                                <p className="text-gray-400 mt-2">
                                    {stripHtmlTags(video.caption)}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoModal;