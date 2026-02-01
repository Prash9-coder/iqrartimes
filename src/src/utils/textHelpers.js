// src/utils/textHelpers.js

/**
 * 🧹 Strip HTML tags from text
 * Use this to clean any HTML content for display
 */
export const stripHtmlTags = (html) => {
    if (!html) return '';
    if (typeof html !== 'string') return String(html);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

/**
 * 🔍 Check if value looks like an ID (UUID, MongoDB, etc.)
 */
export const isIdLike = (value) => {
    if (!value || typeof value !== 'string') return true;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const mongoIdPattern = /^[0-9a-f]{24}$/i;
    const numericIdPattern = /^\d+$/;
    const hashPattern = /^[a-zA-Z0-9]{20,}$/;
    return uuidPattern.test(value) || mongoIdPattern.test(value) || numericIdPattern.test(value) || hashPattern.test(value);
};

/**
 * 🧹 Clean article data - removes HTML tags from all text fields
 */
export const cleanArticleData = (article) => {
    if (!article) return null;
    
    return {
        ...article,
        title: stripHtmlTags(article.title),
        excerpt: stripHtmlTags(article.excerpt || article.description || ''),
        description: article.description, // Keep HTML for article content rendering
        content: article.content, // Keep HTML for article content rendering
        author: stripHtmlTags(article.author),
        category: typeof article.category === 'object' 
            ? stripHtmlTags(article.category?.name) 
            : (isIdLike(article.category) ? '' : stripHtmlTags(article.category)),
        tags: Array.isArray(article.tags) 
            ? article.tags.filter(tag => !isIdLike(tag)).map(tag => stripHtmlTags(tag))
            : []
    };
};

/**
 * 🧹 Clean multiple articles
 */
export const cleanArticlesData = (articles) => {
    if (!Array.isArray(articles)) return [];
    return articles.map(cleanArticleData);
};