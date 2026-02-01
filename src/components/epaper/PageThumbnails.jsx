// src/components/epaper/PageThumbnails.jsx

import { FiCheck, FiImage } from 'react-icons/fi';
import { getPageLabel } from '../../data/epaperData';

// ✅ UPDATED: Same base URL
// ✅ CHANGE LINE 9 - Use S3 URL
const BASE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://iqrar-times.s3.ap-south-1.amazonaws.com/';

// ✅ Helper: Get Full Image URL
const getImageUrl = (page) => {
    const imagePath = page?.image ||
        page?.thumbnail ||
        page?.image_url ||
        page?.imageUrl ||
        page?.file_url ||
        page?.file ||
        page?.url ||
        null;

    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return BASE_MEDIA_URL + cleanPath;
};

const PageThumbnails = ({ pages, currentPage, setCurrentPage, isVisible }) => {
    if (!isVisible) return null;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
        console.warn('⚠️ No pages available for thumbnails');
        return (
            <div className="w-48 lg:w-56 bg-white border-r border-gray-200 h-[calc(100vh-200px)] sticky top-[200px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">No pages available</p>
            </div>
        );
    }

    return (
        <div className="w-48 lg:w-56 bg-white border-r border-gray-200 overflow-y-auto 
                    h-[calc(100vh-200px)] sticky top-[200px]">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-sm">All Pages</h3>
                <p className="text-xs text-gray-400">{pages.length} pages</p>
            </div>

            <div className="p-2 space-y-2">
                {pages.map((page) => {
                    const imageUrl = getImageUrl(page);
                    const pageNum = page.pageNumber || page.page_number || 1;

                    return (
                        <button
                            key={page.id}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-full relative group rounded-lg overflow-hidden border-2 transition-all
                                ${currentPage === pageNum
                                    ? 'border-primary shadow-lg'
                                    : 'border-transparent hover:border-gray-300'}`}
                        >
                            {/* Thumbnail Image */}
                            <div className="relative aspect-[3/4] bg-gray-100">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={`Page ${pageNum}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            console.warn(`❌ Failed to load thumbnail for page ${pageNum}:`, imageUrl);
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            if (e.target.nextElementSibling) {
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}

                                {/* Fallback */}
                                <div
                                    className={`w-full h-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 absolute inset-0 ${imageUrl ? 'hidden' : 'flex'}`}
                                >
                                    <FiImage size={24} />
                                    <span className="text-xs mt-1">Page {pageNum}</span>
                                </div>

                                {/* Page Number Badge */}
                                <div className={`absolute top-1 left-1 px-2 py-0.5 rounded text-xs font-bold
                                    ${currentPage === pageNum
                                        ? 'bg-primary text-white'
                                        : 'bg-black/60 text-white'}`}>
                                    {pageNum}
                                </div>

                                {/* Current Page Indicator */}
                                {currentPage === pageNum && (
                                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                                        <FiCheck size={12} />
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all" />
                            </div>

                            {/* Page Label */}
                            <div className={`p-1.5 text-xs text-center font-medium truncate
                                ${currentPage === pageNum ? 'text-primary' : 'text-gray-600'}`}>
                                {getPageLabel(pageNum, pages.length)}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PageThumbnails;