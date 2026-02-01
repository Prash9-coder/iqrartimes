// src/data/newsData.js - COMPLETE VERSION WITH DATE/TIME & VIEWS COUNT

const API_BASE_URL = import.meta.env.DEV
    ? '/api'
    : 'https://api.iqrartimes.com';

export const categories = ['Home', 'India', 'World', 'Business', 'Technology', 'Sports', 'Entertainment', 'Lifestyle', 'Videos'];

let allArticles = [];
let categoryArticlesCache = {};
let categoryNameToIdMap = {};
let allCategories = [];
let isLoading = false;
let isDataFetched = false;
let currentLanguage = null;

const LANGUAGE_MAP = {
    'hi': 'HINDI',
    'en': 'ENGLISH',
};

const VIEWS_OVERRIDES = {
    '0d3fc8ca-5a4d-451b-b1d4-4eae49ec3a99': 4471,
    '55bd2870-912f-4410-afd3-5183244515f3': 5789,
    '0729df3d-a495-4867-895c-1761869369e3': 4423,
    'e53fb658-e2e3-4fc5-9fd1-56705da09ce6': 5212
};

// ═══════════════════════════════════════════════════════════════
// 🧹 HTML TAGS STRIPPER
// ═══════════════════════════════════════════════════════════════
const stripHtmlTags = (html) => {
    if (!html) return '';
    if (typeof html !== 'string') return String(html);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

// ═══════════════════════════════════════════════════════════════
// 🚨 ERROR LOGGER
// ═══════════════════════════════════════════════════════════════
const logError = (location, message, details = null) => {
    console.group('%c🚨 ERROR', 'background: #ff0000; color: white; padding: 2px 8px; border-radius: 4px;');
    console.log('%c📍 Location:', 'color: #ff6b6b; font-weight: bold;', location);
    console.log('%c❌ Message:', 'color: #ff6b6b; font-weight: bold;', message);
    if (details) console.log('%c🔍 Details:', 'color: #ff6b6b;', details);
    console.groupEnd();
};

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const isUUID = (str) => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

const isVideosCategoryName = (category) => {
    if (!category) return false;
    const normalized = decodeURIComponent(category).toLowerCase().trim();
    return normalized === 'videos' || normalized === 'video' || normalized === 'विडियोज़' || normalized === 'वीडियो';
};

const getCurrentLanguage = () => (localStorage.getItem('i18nextLng') || 'hi').split('-')[0].toLowerCase();

// ═══════════════════════════════════════════════════════════════
// 📅 DATE & TIME FORMATTING
// ═══════════════════════════════════════════════════════════════

/**
 * Format date for display - Full date with time
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recently';
        
        const currentLang = getCurrentLanguage();
        const locale = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        
        return date.toLocaleString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return 'Recently';
    }
};

/**
 * Get relative time - "2 hours ago", "3 days ago" etc.
 */
const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        
        const currentLang = getCurrentLanguage();
        
        // Hindi labels
        if (currentLang === 'hi') {
            if (diffMinutes < 1) return 'Now';
            if (diffMinutes < 60) return `${diffMinutes} Minutes ago`;
            if (diffHours < 24) return `${diffHours} Hours ago.`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} Days ago`;
            if (diffWeeks < 4) return `${diffWeeks} Weeks ago`;
            if (diffMonths < 12) return `${diffMonths} Months ago`;
            return formatDate(dateString);
        }
        
        // English labels
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        return formatDate(dateString);
        
    } catch {
        return '';
    }
};

/**
 * Format date only (without time)
 */
const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const currentLang = getCurrentLanguage();
        const locale = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        
        return date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '';
    }
};

/**
 * Format time only
 */
const formatTimeOnly = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return '';
    }
};

// ═══════════════════════════════════════════════════════════════
// 👁️ VIEWS FORMATTER - 4471 → "4.5K"
// ═══════════════════════════════════════════════════════════════
const formatViews = (views) => {
    if (!views || views === 0) return '0';
    if (views < 1000) return views.toString();
    if (views < 1000000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// ═══════════════════════════════════════════════════════════════
// 🔗 SLUG CREATOR
// ═══════════════════════════════════════════════════════════════
const createSlug = (title, id = null) => {
    if (!title) return 'untitled-' + (id || Date.now());

    let slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
        .trim();

    if (id) {
        const shortId = typeof id === 'string' ? id.substring(0, 8) : id;
        slug = `${slug}-${shortId}`;
    }

    return slug || 'article-' + (id || Date.now());
};

// ═══════════════════════════════════════════════════════════════
// 🖼️ PLACEHOLDER IMAGE
// ═══════════════════════════════════════════════════════════════
const getPlaceholderImage = (category) => 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80';

// ═══════════════════════════════════════════════════════════════
// 🎬 VIDEO URL EXTRACTOR
// ═══════════════════════════════════════════════════════════════
const getVideoUrl = (news) => {
    try {
        if (news.video) {
            if (Array.isArray(news.video) && news.video.length > 0) {
                const v = news.video[0];
                if (typeof v === 'string' && v.trim() !== '') return v.trim();
                if (v && v.url && v.url.trim() !== '') return v.url.trim();
            }
            if (typeof news.video === 'string' && news.video.trim() !== '') return news.video.trim();
            if (typeof news.video === 'object' && news.video.url && news.video.url.trim() !== '') return news.video.url.trim();
        }

        if (news.youtube_url) {
            if (Array.isArray(news.youtube_url) && news.youtube_url.length > 0 && news.youtube_url[0].trim() !== '') {
                return news.youtube_url[0].trim();
            }
            if (typeof news.youtube_url === 'string' && news.youtube_url.trim() !== '') return news.youtube_url.trim();
        }

        return '';
    } catch (e) {
        return '';
    }
};

// ═══════════════════════════════════════════════════════════════
// 👤 AUTHOR NAME EXTRACTOR
// ═══════════════════════════════════════════════════════════════
const getAuthorName = (news) => {
    let author = '';
    
    if (news.created_by) {
        if (typeof news.created_by === 'object' && news.created_by.name) {
            author = news.created_by.name;
        } else if (typeof news.created_by === 'object' && news.created_by.username) {
            author = news.created_by.username;
        } else if (typeof news.created_by === 'object' && (news.created_by.first_name || news.created_by.last_name)) {
            author = `${news.created_by.first_name || ''} ${news.created_by.last_name || ''}`.trim();
        } else if (typeof news.created_by === 'string') {
            author = news.created_by;
        }
    } else if (news.author) {
        if (typeof news.author === 'object' && news.author.name) {
            author = news.author.name;
        } else if (typeof news.author === 'string') {
            author = news.author;
        }
    } else if (news.source) {
        author = news.source;
    }

    return stripHtmlTags(author);
};

// ═══════════════════════════════════════════════════════════════
// 📂 CATEGORY EXTRACTORS
// ═══════════════════════════════════════════════════════════════
const getCategoryIds = (news) => {
    if (news.categories && Array.isArray(news.categories)) {
        return news.categories;
    }
    if (news.category) {
        if (typeof news.category === 'object' && news.category.id) {
            return [news.category.id];
        }
        if (typeof news.category === 'string') {
            return [news.category];
        }
    }
    if (news.category_id) {
        return [news.category_id];
    }
    return [];
};

const getCategoryName = (news) => {
    let categoryName = '';
    
    if (news.categories && Array.isArray(news.categories) && news.categories.length > 0) {
        const firstCat = news.categories[0];
        if (typeof firstCat === 'object' && firstCat.name) {
            categoryName = firstCat.name;
        } else if (typeof firstCat === 'string' && !isUUID(firstCat)) {
            categoryName = firstCat;
        }
    } else if (news.category) {
        if (typeof news.category === 'object' && news.category.name) {
            categoryName = news.category.name;
        } else if (typeof news.category === 'string' && !isUUID(news.category)) {
            categoryName = news.category;
        }
    }

    return stripHtmlTags(categoryName);
};

// ═══════════════════════════════════════════════════════════════
// 🌐 API SERVICE
// ═══════════════════════════════════════════════════════════════
const apiService = {
    async fetchNews(language = null, categoryId = null) {
        const languageParam = language
            ? (LANGUAGE_MAP[language.toLowerCase()] || language.toUpperCase())
            : 'HINDI';

        let url = `${API_BASE_URL}/news/news?language=${languageParam}`;

        if (categoryId && isUUID(categoryId)) {
            url += `&category=${categoryId}`;
        }

        console.log('🌐 Fetching news from:', url);
        console.log('   Language parameter:', languageParam);
        console.log('   Category ID:', categoryId);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const data = await response.json();

            console.log('📡 API Response:', data);

            let articles = [];
            if (data.success && Array.isArray(data.data)) {
                articles = data.data;
            } else if (Array.isArray(data)) {
                articles = data;
            } else if (data.results) {
                articles = data.results;
            }

            console.log('✅ Got', articles.length, 'articles from API');

            // Debug: Check if articles actually match the requested language and category
            if (articles.length > 0) {
                const languages = [...new Set(articles.map(a => a.language?.toUpperCase() || 'UNDEFINED'))];
                const categories = [...new Set(articles.map(a => a.category?.name || a.category || 'UNDEFINED'))];
                console.log('   Article languages:', languages);
                console.log('   Article categories:', categories);
            }

            return articles;
        } catch (error) {
            logError('newsData.js → fetchNews', 'API fetch failed', error.message);
            throw error;
        }
    },

    async fetchCategories() {
        const apiLanguage = getCurrentLanguage();
        const apiLanguageCode = LANGUAGE_MAP[apiLanguage] || 'HINDI';
        const url = `${API_BASE_URL}/news/category?language=${apiLanguageCode}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            let categoriesData = [];
            if (Array.isArray(data)) {
                categoriesData = data;
            } else if (data.success && Array.isArray(data.data)) {
                categoriesData = data.data;
            } else if (data.results) {
                categoriesData = data.results;
            }

            // Filter categories for public API:
            // - If a category has children, only show children
            // - If a category has no children, show the category itself
            const filteredCategories = [];
            
            categoriesData.forEach(category => {
                const hasChildren = category.children && category.children.length > 0;
                
                if (hasChildren) {
                    // If category has children, add only children to public categories
                    category.children.forEach(child => {
                        filteredCategories.push({
                            ...child,
                            parent_id: category.id,
                            parent_name: category.name
                        });
                    });
                } else {
                    // If category has no children, add the category itself
                    filteredCategories.push(category);
                }
            });

            filteredCategories.forEach(cat => {
                if (cat.name && cat.id) {
                    const normalizedName = cat.name.toLowerCase().trim();
                    categoryNameToIdMap[normalizedName] = cat.id;
                    categoryNameToIdMap[encodeURIComponent(normalizedName)] = cat.id;
                }
            });

            console.log('📂 Category Name to ID Map:', categoryNameToIdMap);
            console.log(`📂 Fetched ${categoriesData.length} categories, filtered to ${filteredCategories.length} for language: ${apiLanguageCode}`);
            return filteredCategories;
        } catch (error) {
            logError('newsData.js → fetchCategories', 'Categories fetch failed', error.message);
            return [];
        }
    },
};

// ═══════════════════════════════════════════════════════════════
// 🔄 TRANSFORM API NEWS - WITH DATE/TIME & VIEWS COUNT
// ═══════════════════════════════════════════════════════════════
const transformApiNews = (apiNews, category = 'home') => {
    return apiNews.map((news, index) => {
        const videoUrl = getVideoUrl(news);
        const imageUrl = (news.image && Array.isArray(news.image) && news.image[0])
            ? news.image[0]
            : (news.image || news.featured_image || news.thumbnail || getPlaceholderImage(category));

        const articleId = news.id || news._id || `api-${Date.now()}-${index}`;
        
        const cleanTitle = stripHtmlTags(news.title || news.headline || 'Untitled');
        const articleSlug = news.slug || createSlug(cleanTitle, articleId);
        
        const authorName = getAuthorName(news);
        const categoryName = getCategoryName(news);
        const categoryIds = getCategoryIds(news);

        const rawExcerpt = news.excerpt || news.description || news.summary || '';
        const cleanExcerpt = stripHtmlTags(rawExcerpt);

        const rawTags = news.tags || [categoryName || 'home'];
        const cleanTags = Array.isArray(rawTags) 
            ? rawTags.map(tag => stripHtmlTags(typeof tag === 'string' ? tag : tag?.name || '')).filter(Boolean)
            : [categoryName || 'home'];

        // ✅ Get the raw date string
        const rawDate = news.published_at || news.created_at || news.date || new Date().toISOString();

        // ✅ Get views count from API or override
        const viewsCount = VIEWS_OVERRIDES[news.id] || news.views_count || news.views || 0;

        // ✅ Get comments count from API
        const commentsCount = news.comments_count || 0;

        return {
            id: articleId,
            title: cleanTitle,
            slug: articleSlug,
            category: categoryName,
            categoryIds: categoryIds,
            excerpt: cleanExcerpt,
            description: news.content || news.body || news.description || '',
            content: news.content || news.body || news.description || '',
            image: imageUrl,
            author: authorName,
            
            // ✅ Multiple date formats
            date: rawDate,
            time: formatDate(rawDate),
            relativeTime: getRelativeTime(rawDate),
            dateOnly: formatDateOnly(rawDate),
            timeOnly: formatTimeOnly(rawDate),
            
            // ✅ Trending & Breaking flags
            trending: news.is_trending || news.trending || false,
            isBreaking: news.is_breaking || news.breaking || false,
            
            // ✅ Tags
            tags: cleanTags,
            
            // ✅ Views count from API
            views: viewsCount,
            viewsCount: viewsCount,
            formattedViews: formatViews(viewsCount),
            
            // ✅ Comments count from API
            commentsCount: commentsCount,
            
            // ✅ Original data for debugging
            _original: news,
            
            // ✅ Video data
            video: videoUrl,
            hasVideo: videoUrl !== '',
            videos: videoUrl ? [{ url: videoUrl, type: 'video/mp4', duration: '10:00', thumbnail: imageUrl }] : []
        };
    });
};

// ═══════════════════════════════════════════════════════════════
// 🔍 CATEGORY ID RESOLVER
// ═══════════════════════════════════════════════════════════════
const getCategoryIdFromName = async (categoryName) => {
    const normalizedName = decodeURIComponent(categoryName).toLowerCase().trim();

    if (categoryNameToIdMap[normalizedName]) {
        return categoryNameToIdMap[normalizedName];
    }

    if (Object.keys(categoryNameToIdMap).length === 0) {
        await apiService.fetchCategories();
    }

    return categoryNameToIdMap[normalizedName] || null;
};

// ═══════════════════════════════════════════════════════════════
// 📰 FETCH NEWS DATA
// ═══════════════════════════════════════════════════════════════
export const fetchNewsData = async (category = 'home', forceRefresh = false) => {
    const apiLanguage = getCurrentLanguage();

    if (currentLanguage !== null && currentLanguage !== apiLanguage) {
        forceRefresh = true;
        isDataFetched = false;
        allArticles = [];
        categoryArticlesCache = {};
        categoryNameToIdMap = {};
    }

    if (isLoading) {
        while (isLoading) await new Promise(r => setTimeout(r, 100));
        return allArticles;
    }

    if (isDataFetched && !forceRefresh && currentLanguage === apiLanguage && allArticles.length > 0) {
        return allArticles;
    }

    isLoading = true;
    currentLanguage = apiLanguage;

    try {
        await apiService.fetchCategories();
        const apiNews = await apiService.fetchNews(apiLanguage, null);

        if (apiNews && apiNews.length > 0) {
            allArticles = transformApiNews(apiNews, 'home');
            isDataFetched = true;
            console.log('✅ Fetched', allArticles.length, 'total articles for HOME');
        } else {
            allArticles = [];
            isDataFetched = true;
        }
    } catch (error) {
        logError('fetchNewsData', 'Critical failure', error.message);
        allArticles = [];
        isDataFetched = false;
    }

    isLoading = false;
    return allArticles;
};

// ═══════════════════════════════════════════════════════════════
// 📂 GET ARTICLES BY CATEGORY
// ═══════════════════════════════════════════════════════════════
export const getArticlesByCategory = async (category, forceRefresh = false) => {
    const apiLanguage = getCurrentLanguage();
    const decodedCategory = decodeURIComponent(category || '').trim();
    const normalizedCategory = decodedCategory.toLowerCase();

    console.log('📂 getArticlesByCategory called:', { 
        category, 
        decodedCategory, 
        normalizedCategory,
        categoryNameToIdMapKeys: Object.keys(categoryNameToIdMap),
        apiLanguage
    });

    if (normalizedCategory === 'home' || normalizedCategory === 'all' || normalizedCategory === '') {
        const allNews = await fetchNewsData('home', forceRefresh);
        return allNews.filter(a => !a.hasVideo);
    }

    const cacheKey = `${apiLanguage}_${normalizedCategory}`;
    if (!forceRefresh && categoryArticlesCache[cacheKey]) {
        console.log('📦 Returning cached articles for:', normalizedCategory);
        return categoryArticlesCache[cacheKey];
    }

    try {
        let categoryId = null;

        if (isUUID(category)) {
            categoryId = category;
        } else {
            categoryId = await getCategoryIdFromName(decodedCategory);
            console.log('🔄 Converted category name to ID:', decodedCategory, '→', categoryId);
        }

        if (categoryId) {
            console.log('🚀 SINGLE API CALL with category:', categoryId);
            const apiNews = await apiService.fetchNews(apiLanguage, categoryId);

            console.log('📡 API News Response:', apiNews);

            if (apiNews && apiNews.length > 0) {
                const transformedArticles = transformApiNews(apiNews, normalizedCategory);
                categoryArticlesCache[cacheKey] = transformedArticles;
                console.log('✅ Got', transformedArticles.length, 'articles for:', decodedCategory);
                return transformedArticles;
            } else {
                console.log('⚠️ API returned 0 articles for category:', categoryId);
                categoryArticlesCache[cacheKey] = [];
                return [];
            }
        }

        console.log('⚠️ Fallback to local filtering for:', normalizedCategory);
        if (allArticles.length === 0) {
            await fetchNewsData('home', forceRefresh);
        }

        console.log('🔍 Local filtering - All articles count:', allArticles.length);
        console.log('🔍 Category name to match:', normalizedCategory);

        const filteredArticles = allArticles.filter(article => {
            const articleCategory = (article.category || '').toLowerCase();
            const articleCategoryIds = article.categoryIds || [];
            
            // Check if article matches category by name or category ID
            const matchesByName = articleCategory === normalizedCategory ||
                articleCategory.includes(normalizedCategory) ||
                normalizedCategory.includes(articleCategory);
            
            const matchesById = articleCategoryIds.some(id => {
                // Check if any of the article's category IDs match with categoryNameToIdMap
                const idStr = String(id).toLowerCase();
                const categoryIdFromMap = categoryNameToIdMap[normalizedCategory];
                
                return categoryIdFromMap && String(categoryIdFromMap).toLowerCase() === idStr;
            });

            // Debug individual articles
            const debugInfo = {
                id: article.id,
                title: article.title,
                category: articleCategory,
                categoryIds: articleCategoryIds,
                matchesByName,
                matchesById,
                categoryIdFromMap: categoryNameToIdMap[normalizedCategory]
            };

            if (matchesByName || matchesById) {
                console.log('✅ Article matches:', debugInfo);
            } else {
                console.log('❌ Article does NOT match:', debugInfo);
            }

            return matchesByName || matchesById;
        });

        categoryArticlesCache[cacheKey] = filteredArticles;
        console.log('✅ Filtered', filteredArticles.length, 'articles locally');
        return filteredArticles;

    } catch (error) {
        logError('getArticlesByCategory', 'Failed to fetch category articles', error.message);

        if (allArticles.length === 0) {
            await fetchNewsData('home', true);
        }

        console.log('🔍 Local filtering (error fallback) - All articles count:', allArticles.length);
        console.log('🔍 Category name to match:', normalizedCategory);

        const filteredArticles = allArticles.filter(article => {
            const articleCategory = (article.category || '').toLowerCase();
            const articleCategoryIds = article.categoryIds || [];
            
            const matchesByName = articleCategory === normalizedCategory ||
                articleCategory.includes(normalizedCategory) ||
                normalizedCategory.includes(articleCategory);
            
            const matchesById = articleCategoryIds.some(id => {
                const idStr = String(id).toLowerCase();
                const categoryIdFromMap = categoryNameToIdMap[normalizedCategory];
                
                return categoryIdFromMap && String(categoryIdFromMap).toLowerCase() === idStr;
            });

            return matchesByName || matchesById;
        });

        categoryArticlesCache[cacheKey] = filteredArticles;
        return filteredArticles;
    }
};

// ═══════════════════════════════════════════════════════════════
// 📤 EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const getAllArticles = async () => await fetchNewsData('home');

export const getNonVideoArticles = async () => {
    if (allArticles.length === 0) await fetchNewsData('home');
    return allArticles.filter(a => !a.hasVideo);
};

export const getNonVideoArticlesByCategory = async (category) => {
    const allCategoryArticles = await getArticlesByCategory(category, true);
    return allCategoryArticles.filter(a => !a.hasVideo);
};

export const getVideoArticles = async () => {
    if (allArticles.length === 0) await fetchNewsData('home');
    return allArticles.filter(a => a.hasVideo && a.video && a.video.trim() !== '');
};

export const getVideoArticlesByCategory = async (category) => {
    const allCategoryArticles = await getArticlesByCategory(category, true);
    return allCategoryArticles.filter(a => a.hasVideo && a.video && a.video.trim() !== '');
};

export const getTrendingArticles = async () => {
    if (allArticles.length === 0) await fetchNewsData('home');
    const nonVideoArticles = allArticles.filter(a => !a.hasVideo);
    const trendingNonVideo = nonVideoArticles.filter(a => a.trending);

    if (trendingNonVideo.length >= 5) return trendingNonVideo.slice(0, 5);

    const remaining = 5 - trendingNonVideo.length;
    const otherNonVideo = nonVideoArticles.filter(a => !a.trending).slice(0, remaining);
    return [...trendingNonVideo, ...otherNonVideo];
};

export const getArticleBySlug = async (slug) => {
    if (!slug) return null;

    if (allArticles.length === 0) {
        await fetchNewsData('home');
    }

    if (allArticles.length === 0) return null;

    const normalizedSlug = slug.toLowerCase().trim();

    let article = allArticles.find(a => a.slug === normalizedSlug);
    if (article) return article;

    const slugParts = normalizedSlug.split('-');
    if (slugParts.length > 1) {
        const possibleId = slugParts[slugParts.length - 1];

        article = allArticles.find(a => {
            const articleId = String(a.id || '').toLowerCase();
            return articleId === possibleId ||
                articleId.startsWith(possibleId) ||
                articleId.endsWith(possibleId) ||
                possibleId.includes(articleId.substring(0, 8));
        });
        if (article) return article;
    }

    article = allArticles.find(a => String(a.id) === slug || a.id === slug);
    if (article) return article;

    article = allArticles.find(a => {
        const aSlug = (a.slug || '').toLowerCase();
        return aSlug.includes(normalizedSlug) || normalizedSlug.includes(aSlug);
    });

    return article || null;
};

export const getRelatedArticles = async (id, category, limit = 3) => {
    if (allArticles.length === 0) await fetchNewsData('home');

    const nonVideoArticles = allArticles.filter(a =>
        a.id !== id && !a.hasVideo
    );

    const sameCategory = nonVideoArticles.filter(a =>
        a.category?.toLowerCase() === category?.toLowerCase()
    );

    if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
    return nonVideoArticles.slice(0, limit);
};

export const searchArticles = async (query) => {
    if (!query) return [];
    if (allArticles.length === 0) await fetchNewsData('home');
    const q = query.toLowerCase();
    return allArticles
        .filter(a => !a.hasVideo)
        .filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
};

export const refreshNewsData = async () => {
    isDataFetched = false;
    allArticles = [];
    categoryArticlesCache = {};
    categoryNameToIdMap = {};
    currentLanguage = null;
    return await fetchNewsData('home', true);
};

export const fetchCategoriesFromApi = async () => {
    try {
        const apiLanguage = getCurrentLanguage();
        const apiLanguageCode = LANGUAGE_MAP[apiLanguage] || 'HINDI';
        allCategories = await apiService.fetchCategories();
        
        // Filter categories by current language
        const filteredCategories = allCategories.filter(category => 
            category.language?.toUpperCase() === apiLanguageCode
        );
        
        console.log(`📂 Filtered categories for ${apiLanguageCode}:`, filteredCategories.length, 'out of', allCategories.length);
        return filteredCategories;
    } catch { return []; }
};

export const clearCategoryCache = () => {
    categoryArticlesCache = {};
};

// ═══════════════════════════════════════════════════════════════
// 📤 EXPORT DATE & VIEWS FUNCTIONS FOR USE IN COMPONENTS
// ═══════════════════════════════════════════════════════════════
export { 
    formatDate, 
    getRelativeTime, 
    formatDateOnly, 
    formatTimeOnly,
    formatViews,
    allArticles, 
    apiService 
};