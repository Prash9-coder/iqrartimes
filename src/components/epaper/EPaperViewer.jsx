// src/components/epaper/EPaperViewer.jsx

import { useState, useRef, useEffect } from 'react';
import {
    FiZoomIn,
    FiZoomOut,
    FiMaximize2,
    FiMinimize2,
    FiRotateCw,
    FiDownload,
    FiShare2,
    FiChevronLeft,
    FiChevronRight,
    FiGrid,
    FiPrinter
} from 'react-icons/fi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const EPaperViewer = ({
    pages,
    currentPage,
    setCurrentPage,
    showThumbnails,
    setShowThumbnails
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const viewerRef = useRef(null);
    const currentPageData = pages[currentPage - 1];

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' && currentPage < pages.length) {
                setCurrentPage(currentPage + 1);
            } else if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, pages.length, isFullscreen]);

    // Reset loading state when page changes
    useEffect(() => {
        setIsLoading(true);
    }, [currentPage]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentPageData.hdImage;
        link.download = `page-${currentPage}.jpg`;
        link.click();
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `E-Paper Page ${currentPage}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open(currentPageData.hdImage, '_blank');
        printWindow?.print();
    };

    return (
        <div ref={viewerRef} className="flex-1 flex flex-col bg-gray-800 relative">
            {/* Toolbar */}
            <div className="bg-secondary text-white px-4 py-2 flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className={`p-2 rounded-lg transition-all ${showThumbnails ? 'bg-primary' : 'hover:bg-white/10'}`}
                        title="Toggle Thumbnails"
                    >
                        <FiGrid size={18} />
                    </button>

                    <div className="h-6 w-px bg-white/20 mx-2" />

                    {/* Page Navigation */}
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Previous Page"
                    >
                        <FiChevronLeft size={18} />
                    </button>

                    <div className="flex items-center bg-white/10 rounded-lg px-3 py-1">
                        <input
                            type="number"
                            min="1"
                            max={pages.length}
                            value={currentPage}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= pages.length) {
                                    setCurrentPage(val);
                                }
                            }}
                            className="w-12 bg-transparent text-center font-semibold outline-none"
                        />
                        <span className="text-white/60 ml-1">/ {pages.length}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                        disabled={currentPage === pages.length}
                        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Next Page"
                    >
                        <FiChevronRight size={18} />
                    </button>
                </div>

                {/* Center - Page Info */}
                <div className="hidden md:block text-center">
                    <span className="text-white/80 text-sm">
                        {currentPageData?.section} • Page {currentPage}
                    </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrint}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="Print Page"
                    >
                        <FiPrinter size={18} />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="Download Page"
                    >
                        <FiDownload size={18} />
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="Share"
                    >
                        <FiShare2 size={18} />
                    </button>

                    <div className="h-6 w-px bg-white/20 mx-2" />

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg hover:bg-white/10"
                        title="Fullscreen"
                    >
                        {isFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Main Viewer with Zoom */}
            <div className="flex-1 relative overflow-hidden">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Zoom Controls - Floating */}
                            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-secondary/90 
                              rounded-xl p-2 backdrop-blur-sm">
                                <button
                                    onClick={() => zoomIn()}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                                    title="Zoom In"
                                >
                                    <FiZoomIn size={20} />
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                                    title="Zoom Out"
                                >
                                    <FiZoomOut size={20} />
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                                    title="Reset Zoom"
                                >
                                    <FiRotateCw size={20} />
                                </button>
                            </div>

                            {/* Page Navigation Arrows - Large */}
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white 
                           text-gray-800 rounded-full p-3 shadow-xl disabled:opacity-30 
                           disabled:cursor-not-allowed transition-all hover:scale-110"
                            >
                                <FiChevronLeft size={24} />
                            </button>

                            <button
                                onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                                disabled={currentPage === pages.length}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white 
                           text-gray-800 rounded-full p-3 shadow-xl disabled:opacity-30 
                           disabled:cursor-not-allowed transition-all hover:scale-110"
                            >
                                <FiChevronRight size={24} />
                            </button>

                            {/* Image Container */}
                            <TransformComponent
                                wrapperClass="!w-full !h-full"
                                contentClass="!flex !items-center !justify-center !w-full !h-full"
                            >
                                <div className="relative">
                                    {/* Loading Skeleton */}
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 border-4 border-primary border-t-transparent 
                                        rounded-full animate-spin" />
                                                <span className="text-white/60">Loading page {currentPage}...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Page Image */}
                                    <img
                                        src={currentPageData?.fullImage}
                                        alt={`Page ${currentPage}`}
                                        className="max-h-[calc(100vh-280px)] w-auto object-contain shadow-2xl"
                                        onLoad={() => setIsLoading(false)}
                                        draggable={false}
                                    />
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>

            {/* Bottom Page Strip */}
            <div className="bg-secondary/95 border-t border-white/10 px-4 py-2">
                <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
                    {pages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => setCurrentPage(page.pageNumber)}
                            className={`flex-shrink-0 w-8 h-8 rounded-lg font-semibold text-sm transition-all
                ${currentPage === page.pageNumber
                                    ? 'bg-primary text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                        >
                            {page.pageNumber}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EPaperViewer;