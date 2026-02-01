// src/components/BreakingNews.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBolt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import newsApi from '../../api/newsApi';

const BreakingNews = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef(null);

    // ✅ Fetch breaking news from API
    useEffect(() => {
        const loadBreakingNews = async () => {
            try {
                setIsLoading(true);
                const response = await newsApi.getAll();
                if (response.success && response.data) {
                    const allNews = response.data;
                    const breakingNews = allNews.filter(article => article.isBreaking);
                    if (breakingNews.length > 0) {
                        setNews(breakingNews.map(article => ({
                            title: article.title,
                            slug: article.slug,
                        })));
                    } else {
                        // Fallback to recent news if no breaking news
                        setNews(allNews.slice(0, 10).map(article => ({
                            title: article.title,
                            slug: article.slug,
                        })));
                    }
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error('Failed to load breaking news:', error);
                // Keep empty array, component will handle gracefully
            } finally {
                setIsLoading(false);
            }
        };

        loadBreakingNews();
    }, []);

    // ✅ Auto-rotate news
    useEffect(() => {
        if (!isPaused && news.length > 0) {
            intervalRef.current = setInterval(() => {
                nextNews();
            }, 4000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, news.length, currentIndex]);

    const nextNews = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const prevNews = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const currentNews = news[currentIndex];

    if (isLoading || !currentNews) return null;

    return (
        <div
            className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-3 py-2">
                    {/* Breaking News Label */}
                    <div className="flex items-center gap-2 bg-white text-red-600 px-3 py-1 rounded-full font-bold text-xs md:text-sm whitespace-nowrap animate-pulse shrink-0">
                        <FaBolt className="text-yellow-500" />
                        <span className="hidden sm:inline">{t('breakingNews', 'ब्रेकिंग न्यूज़')}</span>
                        <span className="sm:hidden">LIVE</span>
                    </div>

                    {/* News Ticker */}
                    <div className="flex-1 overflow-hidden min-w-0">
                        <div
                            className={`transition-all duration-500 ${isAnimating
                                ? 'opacity-0 transform -translate-y-2'
                                : 'opacity-100 transform translate-y-0'
                                }`}
                        >
                            <Link
                                to={`/article/${currentNews.slug}`}
                                className="hover:underline font-medium text-sm md:text-base block truncate"
                            >
                                {currentNews.title}
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={prevNews}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Previous news"
                        >
                            <FaChevronLeft size={12} />
                        </button>

                        {/* Dots Indicator - Desktop only */}
                        <div className="hidden md:flex items-center gap-1 mx-2">
                            {news.slice(0, 5).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex % 5 === index
                                        ? 'bg-white w-3'
                                        : 'bg-white/50 hover:bg-white/70'
                                        }`}
                                    aria-label={`Go to news ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextNews}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Next news"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/20">
                <div
                    className="h-full bg-white/60"
                    style={{
                        width: isPaused ? '0%' : '100%',
                        animation: isPaused ? 'none' : 'progress 4s linear infinite',
                    }}
                />
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default BreakingNews;