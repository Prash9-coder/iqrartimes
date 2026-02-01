// src/components/layout/Header.jsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Search, Menu, X, User, ChevronDown, Newspaper, Tv, Radio, ChevronLeft, ChevronRight, LogOut, Grid3X3 } from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector';
import { useAuth } from '../../context/AuthContext';
import newsApi from '../../api/newsApi';

const LANGUAGE_MAP = {
    en: 'ENGLISH',
    hi: 'HINDI',
};

const DATE_LOCALE_MAP = {
    en: 'en-IN',
    hi: 'hi-IN',
};

const MAX_HEADER_CATEGORIES = 12;
const MAX_ITEMS_PER_COLUMN = 16; // ✅ Reduced to fit better on screen

const Header = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout, isAdmin, isReporter } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const [breakingNews, setBreakingNews] = useState([]);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [breakingNewsLoading, setBreakingNewsLoading] = useState(true);

    const [allCategories, setAllCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formattedDate, setFormattedDate] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const moreButtonRef = useRef(null);
    const moreDropdownRef = useRef(null);
    const navRef = useRef(null);

    const API_BASE_URL = import.meta.env.DEV
        ? '/api'
        : (import.meta.env.VITE_API_BASE_URL || 'https://api.iqrartimes.com');

    // Update date
    useEffect(() => {
        const updateDate = () => {
            const currentLang = i18n.language?.split('-')[0] || 'hi';
            const locale = DATE_LOCALE_MAP[currentLang] || 'en-IN';
            const date = new Date().toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            setFormattedDate(date);
        };

        updateDate();
        i18n.on('languageChanged', updateDate);
        return () => i18n.off('languageChanged', updateDate);
    }, []);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const currentLang = i18n.language?.split('-')[0] || 'hi';
                const apiLang = LANGUAGE_MAP[currentLang] || 'HINDI';

                const url = `${API_BASE_URL}/news/category?language=${apiLang}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    const categories = result.data.map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        icon: cat.icon,
                        priority: cat.priority || 0,
                        hasChildren: cat.children && cat.children.length > 0,
                        children: (cat.children || []).map(child => ({
                            id: child.id,
                            name: child.name,
                            icon: child.icon,
                            priority: child.priority || 0
                        }))
                    }));

                    categories.sort((a, b) => {
                        if (b.priority !== a.priority) return b.priority - a.priority;
                        return a.name.localeCompare(b.name, 'hi');
                    });

                    setAllCategories(categories);
                } else {
                    setAllCategories([]);
                }
            } catch (error) {
                console.error('❌ Failed to fetch categories:', error);
                setAllCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
        i18n.on('languageChanged', fetchCategories);
        return () => i18n.off('languageChanged', fetchCategories);
    }, [API_BASE_URL]);

    // Fetch Breaking News
    useEffect(() => {
        const fetchBreakingNews = async () => {
            try {
                setBreakingNewsLoading(true);
                const currentLang = i18n.language?.split('-')[0] || 'hi';
                const apiLang = LANGUAGE_MAP[currentLang] || 'HINDI';

                const response = await newsApi.getAll();
                if (response.success && Array.isArray(response.data)) {
                    const filteredNews = response.data.filter(article =>
                        article.language?.toUpperCase() === apiLang && article.isBreaking
                    );

                    if (filteredNews.length > 0) {
                        setBreakingNews(filteredNews.map(article => article.title));
                    } else {
                        const recentNews = response.data
                            .filter(article => article.language?.toUpperCase() === apiLang)
                            .slice(0, 8)
                            .map(article => article.title);
                        setBreakingNews(recentNews.length > 0 ? recentNews : response.data.slice(0, 5).map(a => a.title));
                    }
                }
            } catch (error) {
                console.error('❌ Failed to fetch breaking news:', error);
                setBreakingNews([]);
            } finally {
                setBreakingNewsLoading(false);
            }
        };

        fetchBreakingNews();
        i18n.on('languageChanged', fetchBreakingNews);
        return () => i18n.off('languageChanged', fetchBreakingNews);
    }, []);

    // Auto-rotate breaking news
    useEffect(() => {
        if (isPaused || breakingNewsLoading || breakingNews.length === 0) return;
        const interval = setInterval(() => {
            setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isPaused, breakingNewsLoading, breakingNews.length]);

    // Close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (activeDropdown === 'user') setActiveDropdown(null);
            }
            
            const clickedOnButton = moreButtonRef.current?.contains(event.target);
            const clickedOnDropdown = moreDropdownRef.current?.contains(event.target);
            
            if (!clickedOnButton && !clickedOnDropdown) {
                setIsMoreOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    // Close on route change
    useEffect(() => {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMoreOpen(false);
                setActiveDropdown(null);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const nextNews = () => setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length);
    const prevNews = () => setCurrentNewsIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);

    const handleLogout = async () => {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
        await logout();
    };

    // Header: Categories WITHOUT children
    const headerCategories = allCategories.slice(0, MAX_HEADER_CATEGORIES);

    // More: Categories WITH children
    const moreCategories = allCategories.slice(MAX_HEADER_CATEGORIES);
    const hasMoreCategories = moreCategories.length > 0;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    const isActive = (categoryId) => {
        return location.pathname === `/category/${categoryId}`;
    };

    const handleCategoryClick = (categoryId, categoryName) => {
        setIsMoreOpen(false);
        navigate(`/category/${categoryId}`);
    };

    // ✅ Helper function to split long lists into chunks
    const chunkArray = (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    // ✅ Flatten all categories with their chunks for grid layout
    const getDropdownColumns = () => {
        const columns = [];
        
        moreCategories.forEach((category) => {
            const childrenChunks = category.children.length > MAX_ITEMS_PER_COLUMN
                ? chunkArray(category.children, MAX_ITEMS_PER_COLUMN)
                : [category.children];
            
            childrenChunks.forEach((chunk, index) => {
                columns.push({
                    categoryId: category.id,
                    categoryName: category.name,
                    isFirst: index === 0,
                    isContinuation: index > 0,
                    totalChildren: category.children.length,
                    children: chunk
                });
            });
        });
        
        return columns;
    };

    const dropdownColumns = hasMoreCategories ? getDropdownColumns() : [];

    return (
        <header className="fixed top-0 w-full z-50 bg-white shadow-sm">

            {/* Breaking News Bar */}
            {!breakingNewsLoading && breakingNews.length > 0 && (
                <div
                    className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="max-w-7xl mx-auto px-4 flex items-center h-9">
                        <div className="flex items-center gap-1.5 bg-white text-red-600 px-2.5 py-0.5 rounded-full font-bold text-xs mr-3 shrink-0">
                            <Radio size={12} className="animate-pulse" />
                            <span className="hidden sm:inline">{t('breaking.breakingNews', 'Breaking')}</span>
                            <span className="sm:hidden">{t('breaking.live', 'Live')}</span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="transition-all duration-500 ease-in-out" key={currentNewsIndex}>
                                <Link to="/trending" className="text-sm font-medium hover:underline block truncate animate-fadeIn">
                                    {breakingNews[currentNewsIndex]}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button onClick={prevNews} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="hidden md:flex items-center gap-1 mx-1">
                                {breakingNews.slice(0, 5).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentNewsIndex(idx)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                                            currentNewsIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                                        }`}
                                    />
                                ))}
                            </div>
                            <button onClick={nextNews} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="h-0.5 bg-white/20">
                        <div
                            key={currentNewsIndex}
                            className="h-full bg-white/70"
                            style={{
                                animation: isPaused ? 'none' : 'progress 4s linear',
                                width: isPaused ? '0%' : '100%'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="bg-secondary text-red-500">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-10 text-xs">
                    <div className="flex items-center">
                        <span className="hidden md:inline font-medium">{formattedDate}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href="/epaper"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-1 bg-primary hover:bg-accent px-3 py-1 rounded text-white font-semibold transition-colors"
                        >
                            <Newspaper size={14} />
                            {t('header.epaper', 'E-Paper')}
                        </a>
                        <a
                            href="/live-tv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-1 bg-primary hover:bg-accent px-3 py-1 rounded text-white font-semibold transition-colors"
                        >
                            <Tv size={14} />
                            {t('header.livetv', 'Live TV')}
                            <span className="w-1.5 h-1.5 bg-red rounded-full animate-pulse"></span>
                        </a>

                        <LanguageSelector />

                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                                    className="flex items-center hover:text-primary transition-colors p-1"
                                >
                                    <User size={16} className="mr-1" />
                                    <span className="hidden md:inline text-sm truncate max-w-[120px]">
                                        {user?.name || user?.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown size={14} className="ml-1" />
                                </button>

                                {activeDropdown === 'user' && (
                                    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg border min-w-[180px] py-2 z-[9999]">
                                        <div className="px-4 py-2 text-sm border-b">
                                            <div className="font-semibold text-gray-900 truncate">
                                                {user?.name || user?.email}
                                            </div>
                                        </div>
                                        {(isAdmin || isReporter) && (
                                            <Link
                                                to={isAdmin ? '/admin' : '/reporter'}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                📊 {t('header.dashboard', 'Dashboard')}
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center border-t mt-1"
                                        >
                                            <LogOut size={14} className="mr-2" />
                                            {t('common.logout', 'Logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center hover:text-primary transition-colors p-1">
                                <User size={16} className="mr-1" />
                                <span className="hidden md:inline text-sm">{t('common.login', 'Login')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <Link to="/" className="inline-block group shrink-0">
                            <img
                                src="/iqrar1.png"
                                alt="Iqrar Times Logo"
                                className="h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </Link>

                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('header.searchPlaceholder', 'Search news...')}
                                    className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary text-sm"
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold hover:bg-accent transition-colors"
                                >
                                    {t('header.search', 'Search')}
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:block bg-white border-b relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center overflow-x-auto hide-scrollbar">
                        
                        {/* Home Link */}
                        <Link
                            to="/"
                            className={`shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                                location.pathname === '/'
                                    ? 'text-primary border-primary'
                                    : 'text-gray-800 border-transparent hover:text-primary'
                            }`}
                        >
                            {t('header.home', 'Home')}
                        </Link>

                        {/* Loading */}
                        {categoriesLoading && (
                            <div className="shrink-0 px-4 py-3.5 text-sm text-gray-400 flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                <span>Loading...</span>
                            </div>
                        )}

                        {/* Header Categories */}
                        {!categoriesLoading && headerCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.id}`}
                                className={`shrink-0 px-3 py-3.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                                    isActive(category.id)
                                        ? 'text-primary border-primary'
                                        : 'text-gray-800 border-transparent hover:text-primary'
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}

                        {/* MORE BUTTON */}
                        {!categoriesLoading && hasMoreCategories && (
                            <div className="relative shrink-0 ml-2" ref={moreButtonRef}>
                                <button
                                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 my-1.5 rounded-full text-sm font-bold
                                        transition-all duration-300 transform
                                        ${isMoreOpen
                                            ? 'bg-primary text-white shadow-lg scale-105'
                                            : 'bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg hover:scale-105'
                                        }
                                    `}
                                >
                                    <Grid3X3 size={16} />
                                    <span>{t('header.more', 'More')}</span>
                                    <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {moreCategories.length}
                                    </span>
                                    <ChevronDown 
                                        size={14} 
                                        className={`transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} 
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isMoreOpen && hasMoreCategories && (
                    <div 
                        ref={moreDropdownRef}
                        className="absolute left-0 right-0 bg-white shadow-xl border-t z-[9999]"
                    >
                        {/* ✅ CSS Columns - Vertical first, then horizontal */}
                        <div 
                            className="w-full h-full px-6 py-5"
                            style={{
                                columnWidth: '120px',
                                columnGap: '16px',
                                columnFill: 'balance'
                            }}
                        >
                            {dropdownColumns.map((column, index) => (
                                <div 
                                    key={`${column.categoryId}-${index}`} 
                                    className="break-inside-avoid-column mb-6"
                                >
                                    {/* Category Header */}
                                    {column.isFirst ? (
                                        <button
                                            onClick={() => handleCategoryClick(column.categoryId, column.categoryName)}
                                            className="text-sm font-bold text-gray-900 hover:text-primary transition-colors mb-2 block uppercase w-full text-left"
                                        >
                                            {column.categoryName}
                                            {column.totalChildren > MAX_ITEMS_PER_COLUMN && (
                                                <span className="text-xs text-gray-400 font-normal ml-1">
                                                    ({column.totalChildren})
                                                </span>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                                            ↳ {column.categoryName}
                                        </div>
                                    )}

                                    {/* Subcategories */}
                                    <ul className="space-y-1.5">
                                        {column.children.map((child) => (
                                            <li key={child.id}>
                                                <button
                                                    onClick={() => handleCategoryClick(child.id, child.name)}
                                                    className={`text-sm transition-colors block w-full text-left ${
                                                        isActive(child.id)
                                                            ? 'text-primary font-medium'
                                                            : 'text-gray-600 hover:text-primary'
                                                    }`}
                                                >
                                                    {child.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Bottom border line */}
                        <div className="h-1 bg-gradient-to-r from-primary to-accent"></div>
                    </div>
                )}
                            
                      
            </nav>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t max-h-[70vh] overflow-y-auto shadow-lg z-[100]">
                    <nav className="max-w-7xl mx-auto px-4 py-3">
                        
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('header.searchPlaceholder', 'Search news...')}
                                    className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary text-sm"
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>

                        <div className="flex gap-2 mb-4">
                            <a href="/epaper" target="_blank"
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg font-semibold text-sm">
                                <Newspaper size={16} />
                                {t('header.epaper', 'E-Paper')}
                            </a>
                            <a href="/live-tv" target="_blank"
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 rounded-lg font-semibold text-sm">
                                <Tv size={16} />
                                {t('header.livetv', 'Live TV')}
                            </a>
                        </div>

                        {isAuthenticated ? (
                            <div className="border-b border-gray-100 mb-3 pb-3">
                                <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg mb-2">
                                    <div className="font-semibold truncate">{user?.name || user?.email}</div>
                                </div>
                                {(isAdmin || isReporter) && (
                                    <Link
                                        to={isAdmin ? '/admin' : '/reporter'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                    >
                                        📊 {t('header.dashboard', 'Dashboard')}
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded"
                                >
                                    <LogOut size={14} className="mr-2" />
                                    {t('common.logout', 'Logout')}
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100 mb-3"
                            >
                                <User size={16} className="mr-2" />
                                {t('common.login', 'Login')}
                            </Link>
                        )}

                        <Link
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-3 text-sm font-semibold border-b border-gray-100 ${
                                location.pathname === '/' ? 'text-primary bg-primary/5' : 'text-gray-800'
                            }`}
                        >
                            {t('header.home', 'Home')}
                        </Link>

                        {categoriesLoading && (
                            <div className="px-3 py-4 text-sm text-gray-400 flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                Loading...
                            </div>
                        )}

                        {/* Mobile: Categories WITHOUT children */}
                        {!categoriesLoading && headerCategories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-3 text-sm font-semibold border-b border-gray-100 ${
                                    isActive(category.id) ? 'text-primary bg-primary/5' : 'text-gray-800'
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}

                        {/* Mobile: Categories WITH children */}
                        {!categoriesLoading && moreCategories.length > 0 && (
                            <div className="border-t-2 border-primary/20 pt-3 mt-3">
                                <div className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider bg-primary/5 rounded mb-2 flex items-center gap-2">
                                    <Grid3X3 size={14} />
                                    More Categories
                                </div>
                                {moreCategories.map((category) => (
                                    <MobileCategoryAccordion 
                                        key={category.id} 
                                        category={category} 
                                        onClose={() => setIsMobileMenuOpen(false)}
                                        isActive={isActive}
                                        onNavigate={handleCategoryClick}
                                    />
                                ))}
                            </div>
                        )}
                    </nav>
                </div>
            )}

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </header>
    );
};

// Mobile Category Accordion
const MobileCategoryAccordion = ({ category, onClose, isActive, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-b border-gray-100">
            <div className="flex items-center">
                <button
                    onClick={() => {
                        onNavigate(category.id, category.name);
                        onClose();
                    }}
                    className={`flex-1 text-left px-3 py-3 text-sm font-semibold ${
                        isActive(category.id) ? 'text-primary bg-primary/5' : 'text-gray-800'
                    }`}
                >
                    {category.name}
                    <span className="ml-1 text-xs text-gray-400 font-normal">
                        ({category.children.length})
                    </span>
                </button>
                
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="px-4 py-3 text-gray-500 hover:text-primary hover:bg-gray-50"
                >
                    <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {isExpanded && (
                <div className="bg-gray-50 pb-2 pl-4">
                    {category.children.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => {
                                onNavigate(child.id, child.name);
                                onClose();
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-sm border-l-2 transition-colors ${
                                isActive(child.id)
                                    ? 'text-primary border-primary bg-primary/5'
                                    : 'text-gray-600 border-gray-200 hover:text-primary hover:border-primary'
                            }`}
                        >
                            {child.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Header;