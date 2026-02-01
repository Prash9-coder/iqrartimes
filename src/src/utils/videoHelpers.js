// Video extraction and filtering utilities

// 🎬 Extract video URL from article (handles API array format)
export const extractVideoUrl = (article) => {
    if (!article) return '';

    const raw = article._original || article;

    // API returns video as ARRAY
    if (raw.video && Array.isArray(raw.video) && raw.video.length > 0) {
        const firstVideo = raw.video[0];
        if (typeof firstVideo === 'string' && firstVideo.trim().length > 10) {
            return firstVideo.trim();
        }
    }

    // Fallback checks
    if (raw.video && typeof raw.video === 'string' && raw.video.trim().length > 10) {
        return raw.video.trim();
    }

    if (raw.youtube_url && typeof raw.youtube_url === 'string' && raw.youtube_url.trim().length > 10) {
        return raw.youtube_url.trim();
    }

    return '';
};

// 🎬 STRICT check - must have valid video URL
export const hasValidVideo = (article) => {
    const raw = article._original || article;

    // Check if video array exists AND has at least 1 element
    if (raw.video && Array.isArray(raw.video)) {
        if (raw.video.length === 0) return false;
        const firstVideo = raw.video[0];
        if (typeof firstVideo === 'string' && firstVideo.trim().length > 10) {
            return true;
        }
    }

    const videoUrl = extractVideoUrl(article);
    return videoUrl.length > 10;
};

// 🎬 Check if YouTube URL
export const isYouTube = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');
};

// 🎬 Get YouTube video ID
export const getYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch) return shortMatch[1];

        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (watchMatch) return watchMatch[1];

        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
    } catch (e) { }
    return null;
};

// 🎬 Get YouTube thumbnail
export const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

// 🎬 Filter articles to get only videos
export const filterVideoArticles = (articles) => {
    if (!Array.isArray(articles)) return [];
    return articles.filter(article => hasValidVideo(article));
};

// 🎬 Get latest N video articles
export const getLatestVideos = (articles, count = 4) => {
    const videos = filterVideoArticles(articles);
    return videos.slice(0, count);
};