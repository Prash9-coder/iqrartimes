// src/context/NewsContext.jsx - CREATE THIS NEW FILE

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../api/index';

const NewsContext = createContext(null);

export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within NewsProvider');
    }
    return context;
};

export const NewsProvider = ({ children }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // Prevent duplicate calls
    const isFetchingRef = useRef(false);

    // Cache duration: 2 minutes
    const CACHE_DURATION = 2 * 60 * 1000;

    // Smart fetch - only fetches if needed
    const fetchNews = useCallback(async (forceRefresh = false) => {
        // Already fetching? Skip
        if (isFetchingRef.current) {
            console.log('⏳ Already fetching news, skipping...');
            return news;
        }

        // Cache still valid? Use cached data
        const now = Date.now();
        if (!forceRefresh && lastFetched && (now - lastFetched < CACHE_DURATION) && news.length > 0) {
            console.log('✅ Using cached news data');
            return news;
        }

        // Fetch new data
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching fresh news from API...');
            const response = await api.get('/backoffice/news');

            if (response.data?.success) {
                const newsData = response.data.data || [];
                setNews(newsData);
                setLastFetched(Date.now());
                console.log(`✅ Fetched ${newsData.length} news articles`);
                return newsData;
            } else {
                throw new Error(response.data?.description || 'Failed to fetch news');
            }
        } catch (err) {
            console.error('❌ News fetch error:', err.message);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [news, lastFetched]);

    // Force refresh (for manual refresh button)
    const refreshNews = useCallback(() => {
        console.log('🔄 Force refreshing news...');
        return fetchNews(true);
    }, [fetchNews]);

    // Update single news item (after edit)
    const updateNewsItem = useCallback((updatedItem) => {
        setNews(prev => prev.map(item =>
            (item.id === updatedItem.id || item._id === updatedItem._id)
                ? updatedItem
                : item
        ));
    }, []);

    // Add new news item
    const addNewsItem = useCallback((newItem) => {
        setNews(prev => [newItem, ...prev]);
    }, []);

    // Remove news item
    const removeNewsItem = useCallback((id) => {
        setNews(prev => prev.filter(item => item.id !== id && item._id !== id));
    }, []);

    // Clear cache (for logout)
    const clearCache = useCallback(() => {
        setNews([]);
        setLastFetched(null);
        console.log('🗑️ News cache cleared');
    }, []);

    const value = {
        news,
        loading,
        error,
        lastFetched,
        fetchNews,
        refreshNews,
        updateNewsItem,
        addNewsItem,
        removeNewsItem,
        clearCache
    };

    return (
        <NewsContext.Provider value={value}>
            {children}
        </NewsContext.Provider>
    );
};

export default NewsContext;