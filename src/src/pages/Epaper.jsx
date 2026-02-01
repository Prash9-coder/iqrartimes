// src/pages/Epaper.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiZoomIn,
    FiZoomOut,
    FiMaximize2,
    FiMinimize2,
    FiDownload,
    FiShare2,
    FiHome,
    FiX,
    FiChevronDown,
    FiSkipBack,
    FiSkipForward,
    FiList,
    FiArrowUp,
    FiArrowDown
} from 'react-icons/fi';
import {
    editionCategories,
    findEditionById,
    getAvailableDates,
    generatePagesForEdition
} from '../data/epaperData';

const Epaper = () => {
    const { t, i18n } = useTranslation();
    const { edition: editionParam } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const urlPage = searchParams.get('page');
    const isHindi = i18n.language === 'hi';

    // ✅ DEFAULT EDITION - Delhi (change this if needed)
    const DEFAULT_EDITION_ID = 'delhi';

    // States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEdition, setSelectedEdition] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState([]);
    // ✅ CHANGED: Always show viewer (no grid)
    const [showViewer, setShowViewer] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEditionPicker, setShowEditionPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [showPageList, setShowPageList] = useState(true);
    // const [activeCategory, setActiveCategory] = useState(null); // ✅ COMMENTED - Not needed now

    const viewerRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const dates = getAvailableDates();

    // Set page title
    useEffect(() => {
        const editionName = selectedEdition ? (isHindi ? selectedEdition.nameLocal : selectedEdition.name) : '';
        document.title = selectedEdition
            ? `${editionName} - ${t('epaper.title')} | IQRAR TIMES`
            : `${t('epaper.title')} | IQRAR TIMES`;
    }, [selectedEdition, t, isHindi]);

    // loadPages function
    const loadPages = async (edition) => {
        setIsLoading(true);
        setImageLoading(true);

        try {
            if (import.meta.env.DEV) console.log(`🔄 Loading pages for ${edition.name}, Date: ${selectedDate}`);

            const newPages = await generatePagesForEdition(
                edition.id,
                edition.pagesCount,
                selectedDate
            );

            if (import.meta.env.DEV) console.log(`✅ Loaded ${newPages.length} pages`);

            setPages(newPages);
            setZoomLevel(1);
        } catch (error) {
            console.error('❌ Error loading pages:', error);
            setPages([]);
            alert(t('epaper.loadError') || 'Failed to load pages. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ UPDATED: Handle URL params - Default to Delhi if no edition
    useEffect(() => {
        const loadEdition = async () => {
            // ✅ Use URL param or default to Delhi
            const editionId = editionParam || DEFAULT_EDITION_ID;
            const edition = findEditionById(editionId);

            if (edition) {
                setSelectedEdition(edition);
                setShowViewer(true);
                if (urlPage) {
                    setCurrentPage(parseInt(urlPage) || 1);
                }
                await loadPages(edition);

                // ✅ Update URL if not already set
                if (!editionParam) {
                    navigate(`/epaper/${DEFAULT_EDITION_ID}?page=1`, { replace: true });
                }
            } else {
                // ✅ Fallback to Delhi if edition not found
                const defaultEdition = findEditionById(DEFAULT_EDITION_ID);
                if (defaultEdition) {
                    setSelectedEdition(defaultEdition);
                    await loadPages(defaultEdition);
                    navigate(`/epaper/${DEFAULT_EDITION_ID}?page=1`, { replace: true });
                }
            }
        };

        loadEdition();
    }, [editionParam, urlPage, selectedDate]);

    /* ✅ COMMENTED - Not needed without grid
    const handleEditionClick = async (edition) => {
        const fullEdition = {
            ...edition,
            categoryColor: edition.categoryColor,
            category: edition.category,
            categoryLocal: edition.categoryLocal
        };
        setSelectedEdition(fullEdition);
        setShowViewer(true);
        setCurrentPage(1);
        await loadPages(fullEdition);
        navigate(`/epaper/${edition.id}?page=1&date=${selectedDate}`);
    };
    */

    const handleEditionChange = async (edition) => {
        setSelectedEdition(edition);
        setShowEditionPicker(false);
        setCurrentPage(1);
        await loadPages(edition);
        navigate(`/epaper/${edition.id}?page=1&date=${selectedDate}`);
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
        setCurrentPage(1);
        setImageLoading(true);
        if (selectedEdition) {
            await loadPages(selectedEdition);
            navigate(`/epaper/${selectedEdition.id}?page=1&date=${date}`);
        }
    };

    /* ✅ COMMENTED - Not needed without grid
    const handleBackToEditions = () => {
        setShowViewer(false);
        setSelectedEdition(null);
        setPages([]);
        setCurrentPage(1);
        setZoomLevel(1);
        navigate('/epaper');
    };
    */

    // ✅ NEW: Go to home instead of grid
    const handleBackToHome = () => {
        navigate('/');
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoomLevel(1);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const scrollToTop = () => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    };

    const scrollDown = () => {
        scrollContainerRef.current?.scrollBy({ top: 500, behavior: 'smooth' });
    };

    const scrollUp = () => {
        scrollContainerRef.current?.scrollBy({ top: -500, behavior: 'smooth' });
    };

    const goToPage = (pageNum) => {
        setCurrentPage(pageNum);
        setImageLoading(true);
        scrollToTop();
        if (selectedEdition) {
            navigate(`/epaper/${selectedEdition.id}?page=${pageNum}&date=${selectedDate}`, { replace: true });
        }
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(pages.length);
    const goToPrevPage = () => currentPage > 1 && goToPage(currentPage - 1);
    const goToNextPage = () => currentPage < pages.length && goToPage(currentPage + 1);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showViewer) return;
            switch (e.key) {
                case 'ArrowLeft': goToPrevPage(); break;
                case 'ArrowRight': goToNextPage(); break;
                case 'ArrowUp': scrollUp(); e.preventDefault(); break;
                case 'ArrowDown': scrollDown(); e.preventDefault(); break;
                case 'Home':
                    if (e.ctrlKey) goToFirstPage();
                    else scrollToTop();
                    e.preventDefault();
                    break;
                case 'End':
                    if (e.ctrlKey) goToLastPage();
                    else scrollToBottom();
                    e.preventDefault();
                    break;
                case 'PageUp': scrollUp(); e.preventDefault(); break;
                case 'PageDown': scrollDown(); e.preventDefault(); break;
                case ' ': scrollDown(); e.preventDefault(); break;
                case 'Escape':
                    if (isFullscreen) {
                        document.exitFullscreen();
                        setIsFullscreen(false);
                    }
                    break;
                case '+':
                case '=': handleZoomIn(); break;
                case '-': handleZoomOut(); break;
                case '0': handleResetZoom(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showViewer, isFullscreen, currentPage, pages.length]);

    // Zoom with Ctrl + Scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) handleZoomIn();
                else handleZoomOut();
            }
        };
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, []);

    const handleDownload = () => {
        if (pages[currentPage - 1]) {
            const link = document.createElement('a');
            const editionName = isHindi ? selectedEdition?.nameLocal : selectedEdition?.name;
            if (pages[currentPage - 1].isPdf) {
                link.href = pages[currentPage - 1].pdfUrl;
                link.download = `${editionName}-epaper.pdf`;
            } else {
                link.href = pages[currentPage - 1].hdImage;
                link.download = `${editionName}-${t('epaper.page')}-${currentPage}.jpg`;
            }
            link.click();
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const editionName = isHindi ? selectedEdition?.nameLocal : selectedEdition?.name;
        if (navigator.share) {
            await navigator.share({ title: `${editionName} ${t('epaper.title')}`, url });
        } else {
            navigator.clipboard.writeText(url);
            alert(isHindi ? 'लिंक कॉपी हो गया!' : 'Link copied!');
        }
    };

    /* ==================== EDITIONS GRID VIEW - COMMENTED FOR FUTURE USE ====================
    
    const EditionsGrid = () => (
        <div className="min-h-screen bg-[#f5f5f5]">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <a href="/" className="flex items-center">
                                <img
                                    src="/iqrar1.png"
                                    alt="IQRAR TIMES Logo"
                                    className="h-12 md:h-16 lg:h-20 w-auto object-contain"
                                />
                            </a>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <span className="text-xl font-bold text-gray-700">{t('epaper.title')}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent transition-colors"
                                >
                                    <FiCalendar size={18} />
                                    <span className="hidden sm:inline">{dates.find(d => d.value === selectedDate)?.displayDate}</span>
                                    <FiChevronDown size={16} />
                                </button>

                                {showDatePicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border p-4 z-50 w-80">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                                                <h4 className="font-bold text-gray-800">{t('epaper.selectDate')}</h4>
                                                <button onClick={() => setShowDatePicker(false)} className="p-1 hover:bg-gray-100 rounded">
                                                    <FiX size={18} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                                                {dates.map((date) => (
                                                    <button
                                                        key={date.value}
                                                        onClick={() => handleDateChange(date.value)}
                                                        className={`flex flex-col items-center p-2 rounded-lg transition-all
                                                            ${selectedDate === date.value
                                                                ? 'bg-primary text-white'
                                                                : 'hover:bg-gray-100 text-gray-700'}`}
                                                    >
                                                        <span className="text-xs opacity-70">{date.weekday}</span>
                                                        <span className="text-lg font-bold">{date.day}</span>
                                                        <span className="text-xs opacity-70">{date.month}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                                <FiHome size={18} />
                                <span className="hidden sm:inline">{t('epaper.mainSite')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                // Category Tabs - Hindi Names
                <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeCategory === null
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {t('epaper.allEditions')}
                    </button>
                    {editionCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeCategory === category.id
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            style={{
                                backgroundColor: activeCategory === category.id ? category.color : undefined
                            }}
                        >
                            {isHindi ? category.nameLocal : category.name}
                        </button>
                    ))}
                </div>

                // Edition Cards
                {editionCategories
                    .filter(cat => activeCategory === null || cat.id === activeCategory)
                    .map((category) => (
                        <div key={category.id} className="mb-8">
                            <div
                                className="flex items-center gap-3 mb-4 pb-2 border-b-2"
                                style={{ borderColor: category.color }}
                            >
                                <div
                                    className="w-1.5 h-8 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                ></div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isHindi ? category.nameLocal : category.name}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    ({category.editions.length} {t('epaper.editions')})
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                                {category.editions.map((edition) => (
                                    <button
                                        key={edition.id}
                                        onClick={() => handleEditionClick({
                                            ...edition,
                                            categoryColor: category.color,
                                            category: category.name,
                                            categoryLocal: category.nameLocal
                                        })}
                                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary transform hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                                            <img
                                                src={edition.thumbnail}
                                                alt={isHindi ? edition.nameLocal : edition.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                            <div
                                                className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded font-semibold"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                {edition.pagesCount} {isHindi ? 'पृ' : 'p'}
                                            </div>

                                            {edition.isWeekly && (
                                                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded font-semibold">
                                                    {t('epaper.weekly')}
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                                <h3 className="font-bold text-base leading-tight">
                                                    {isHindi ? edition.nameLocal : edition.name}
                                                </h3>
                                                <p className="text-xs text-white/80">
                                                    {isHindi ? edition.name : edition.nameLocal}
                                                </p>
                                            </div>

                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="bg-white text-primary px-3 py-1.5 rounded-full font-bold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    {t('epaper.readNow')}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>

            <footer className="bg-secondary text-white py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-white/60 text-sm">
                        © {new Date().getFullYear()} IQRAR TIMES {t('epaper.title')}. {t('epaper.copyright')}
                    </p>
                </div>
            </footer>
        </div>
    );
    
    ==================== END EDITIONS GRID - COMMENTED ==================== */

    // ==================== PAGE VIEWER ====================
    const PageViewer = () => (
        <div ref={viewerRef} className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
            <header className="bg-[#111] text-white flex-shrink-0 border-b border-white/5 h-10">
                <div className="flex items-center justify-between h-full px-2">
                    <div className="flex items-center gap-1">
                        {/* ✅ CHANGED: Back to Home instead of Grid */}
                        <button
                            onClick={handleBackToHome}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            title="Back to Home"
                        >
                            <FiHome size={18} />
                        </button>

                        <a href="/" className="hidden md:flex items-center">
                            <img
                                src="/iqrar1.png"
                                alt="IQRAR TIMES Logo"
                                className="h-8 w-auto object-contain"
                            />
                        </a>

                        <div className="h-4 w-px bg-white/20 mx-1 hidden md:block"></div>

                        <div className="relative">
                            <button
                                onClick={() => setShowEditionPicker(!showEditionPicker)}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs"
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: selectedEdition?.categoryColor || '#e31e24' }}
                                ></span>
                                <span className="font-medium">
                                    {isHindi ? selectedEdition?.nameLocal : selectedEdition?.name}
                                </span>
                                <FiChevronDown size={10} />
                            </button>

                            {showEditionPicker && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowEditionPicker(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-2xl z-50 w-52 max-h-72 overflow-y-auto">
                                        {editionCategories.map((category) => (
                                            <div key={category.id}>
                                                <div
                                                    className="px-2 py-1 text-[10px] font-bold text-white sticky top-0"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {isHindi ? category.nameLocal : category.name}
                                                </div>
                                                {category.editions.map((edition) => (
                                                    <button
                                                        key={edition.id}
                                                        onClick={() => handleEditionChange({
                                                            ...edition,
                                                            categoryColor: category.color,
                                                            category: category.name,
                                                            categoryLocal: category.nameLocal
                                                        })}
                                                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs transition-colors
                                                            ${selectedEdition?.id === edition.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'}`}
                                                    >
                                                        {isHindi ? edition.nameLocal : edition.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <button onClick={goToFirstPage} disabled={currentPage === 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                            <FiSkipBack size={12} />
                        </button>
                        <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                            <FiChevronLeft size={14} />
                        </button>

                        <div className="flex items-center bg-white/10 rounded px-1.5 py-0.5 mx-0.5">
                            <input
                                type="number"
                                min="1"
                                max={pages.length}
                                value={currentPage}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= 1 && val <= pages.length) goToPage(val);
                                }}
                                className="w-6 bg-transparent text-center font-bold outline-none text-xs"
                            />
                            <span className="text-white/50 text-[10px]">/{pages.length}</span>
                        </div>

                        <button onClick={goToNextPage} disabled={currentPage === pages.length} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                            <FiChevronRight size={14} />
                        </button>
                        <button onClick={goToLastPage} disabled={currentPage === pages.length} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                            <FiSkipForward size={12} />
                        </button>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded text-[10px]"
                            >
                                <FiCalendar size={10} />
                                <span>{dates.find(d => d.value === selectedDate)?.displayDate}</span>
                            </button>

                            {showDatePicker && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-2xl p-2 z-50 w-52">
                                        <div className="grid grid-cols-5 gap-1 max-h-36 overflow-y-auto">
                                            {dates.map((date) => (
                                                <button
                                                    key={date.value}
                                                    onClick={() => handleDateChange(date.value)}
                                                    className={`flex flex-col items-center p-1 rounded text-[10px]
                                                        ${selectedDate === date.value
                                                            ? 'bg-primary text-white'
                                                            : 'hover:bg-gray-100 text-gray-700'}`}
                                                >
                                                    <span className="font-bold text-xs">{date.day}</span>
                                                    <span className="opacity-60">{date.month}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center bg-white/10 rounded px-0.5 hidden sm:flex">
                            <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded">
                                <FiZoomOut size={12} />
                            </button>
                            <span className="text-[10px] text-white/60 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded">
                                <FiZoomIn size={12} />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowPageList(!showPageList)}
                            className={`p-1 rounded ${showPageList ? 'bg-primary' : 'hover:bg-white/10'}`}
                            title={t('epaper.pages')}
                        >
                            <FiList size={12} />
                        </button>

                        <button onClick={handleDownload} className="p-1 hover:bg-white/10 rounded" title={t('epaper.download')}>
                            <FiDownload size={12} />
                        </button>
                        <button onClick={handleShare} className="p-1 hover:bg-white/10 rounded" title={t('epaper.share')}>
                            <FiShare2 size={12} />
                        </button>
                        <button onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded" title={t('epaper.fullscreen')}>
                            {isFullscreen ? <FiMinimize2 size={12} /> : <FiMaximize2 size={12} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {showPageList && pages.length > 0 && (
                    <div className="w-16 lg:w-20 bg-[#111] flex-shrink-0 flex flex-col border-r border-white/5">
                        <div className="flex-1 overflow-y-auto p-1 space-y-1 scrollbar-hide">
                            {pages.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => goToPage(page.pageNumber)}
                                    className={`w-full rounded overflow-hidden transition-all
                                        ${currentPage === page.pageNumber
                                            ? 'ring-2 ring-primary'
                                            : 'opacity-40 hover:opacity-80'}`}
                                >
                                    <div className="aspect-[3/4] bg-gray-800 relative">
                                        <img
                                            src={page.thumbnail}
                                            alt={`${t('epaper.page')} ${page.pageNumber}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className={`absolute inset-x-0 bottom-0 py-0.5 text-center text-[9px] font-bold
                                            ${currentPage === page.pageNumber
                                                ? 'bg-primary text-white'
                                                : 'bg-black/80 text-white/70'}`}>
                                            {page.pageNumber}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex-1 relative bg-[#0a0a0a]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white/50 text-xs">{t('epaper.loading')}</p>
                            </div>
                        </div>
                    ) : pages.length > 0 ? (
                        <>
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-primary text-white rounded-full p-2 disabled:opacity-10 transition-all shadow-2xl"
                            >
                                <FiChevronLeft size={24} />
                            </button>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === pages.length}
                                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-primary text-white rounded-full p-2 disabled:opacity-10 transition-all shadow-2xl"
                            >
                                <FiChevronRight size={24} />
                            </button>

                            <div className="absolute right-14 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 bg-black/60 rounded-lg p-1">
                                <button onClick={scrollToTop} className="p-2 hover:bg-white/20 rounded text-white" title={t('epaper.scrollToTop')}>
                                    <FiArrowUp size={16} />
                                </button>
                                <button onClick={scrollUp} className="p-2 hover:bg-white/20 rounded text-white" title={t('epaper.scrollUp')}>
                                    <FiChevronDown size={16} className="rotate-180" />
                                </button>
                                <button onClick={scrollDown} className="p-2 hover:bg-white/20 rounded text-white" title={t('epaper.scrollDown')}>
                                    <FiChevronDown size={16} />
                                </button>
                                <button onClick={scrollToBottom} className="p-2 hover:bg-white/20 rounded text-white" title={t('epaper.scrollToBottom')}>
                                    <FiArrowDown size={16} />
                                </button>
                            </div>

                            <div ref={scrollContainerRef} className="h-full w-full overflow-auto scroll-smooth">
                                {imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                                        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                <div className="min-h-full flex justify-center py-2 px-4">
                                    <img
                                        src={pages[currentPage - 1]?.hdImage}
                                        alt={`${t('epaper.page')} ${currentPage}`}
                                        className="w-full max-w-5xl h-auto select-none"
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: 'top center',
                                            filter: 'drop-shadow(0 0 60px rgba(0,0,0,0.9))',
                                        }}
                                        onLoad={() => setImageLoading(false)}
                                        draggable={false}
                                    />
                                </div>
                            </div>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-1.5 rounded-full text-xs z-20 backdrop-blur-sm">
                                <span className="font-semibold">
                                    {isHindi ? selectedEdition?.nameLocal : selectedEdition?.name}
                                </span>
                                <span className="mx-2 opacity-40">•</span>
                                <span className="opacity-70">{pages[currentPage - 1]?.title}</span>
                                <span className="mx-2 opacity-40">•</span>
                                <span className="text-primary font-bold">{currentPage}/{pages.length}</span>
                            </div>

                            <div className="absolute bottom-2 right-2 text-white/30 text-[9px] hidden lg:block">
                                {t('epaper.keyboardShortcuts')}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-white/50">
                                <p className="text-lg">{t('epaper.noPagesAvailable')}</p>
                                <p className="text-sm mt-2">{t('epaper.uploadPagesInAdmin')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pages.length > 0 && (
                <div className="bg-[#111] border-t border-white/5 flex-shrink-0 h-9">
                    <div className="flex items-center h-full px-1 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-0.5 mx-auto">
                            {pages.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => goToPage(page.pageNumber)}
                                    className={`flex-shrink-0 w-6 h-6 rounded text-[10px] font-bold transition-all
                                        ${currentPage === page.pageNumber
                                            ? 'bg-primary text-white scale-110'
                                            : 'bg-white/5 text-white/40 hover:bg-white/15 hover:text-white'}`}
                                >
                                    {page.pageNumber}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ✅ CHANGED: Always show PageViewer (no grid condition)
    // return showViewer && selectedEdition ? <PageViewer /> : <EditionsGrid />;
    return <PageViewer />;
};

export default Epaper;