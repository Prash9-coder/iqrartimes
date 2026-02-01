// src/pages/admin/ManageEpaper.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiUpload,
    FiSave,
    FiTrash2,
    FiEye,
    FiImage,
    FiCalendar,
    FiCheckCircle,
    FiAlertCircle,
    FiEdit2,
    FiClock,
    FiX,
    FiMove,
    FiRefreshCw,
    FiFilter
} from 'react-icons/fi';
import epaperApi from '../../api/epaperApi';

// ✅ Base URL for media files
const BASE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://iqrar-times.s3.ap-south-1.amazonaws.com/';

// ==================== HELPER: Get Full Image URL ====================
const getImageUrl = (epaper) => {
    const imagePath = epaper?.image ||
        epaper?.image_url ||
        epaper?.imageUrl ||
        epaper?.thumbnail ||
        epaper?.file_url ||
        epaper?.file ||
        epaper?.url ||
        null;

    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return BASE_MEDIA_URL + cleanPath;
};

// ==================== HELPER: Date Utils ====================
const getDateInfo = (dateStr) => {
    if (!dateStr) return { isToday: false, isTomorrow: false, isFuture: false, isPast: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    return {
        isToday: date.getTime() === today.getTime(),
        isTomorrow: date.getTime() === tomorrow.getTime(),
        isFuture: date.getTime() > today.getTime(),
        isPast: date.getTime() < today.getTime()
    };
};

// ✅ Format relative date
const formatRelativeDate = (dateStr) => {
    const info = getDateInfo(dateStr);
    const date = new Date(dateStr);

    if (info.isToday) return "Today's Edition";
    if (info.isTomorrow) return "Tomorrow's Edition";
    if (info.isFuture) {
        const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        return `Scheduled (${days} days)`;
    }

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// ==================== IMAGE COMPRESSOR UTILITY ====================
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// ==================== EDIT MODAL COMPONENT ====================
const EditEpaperModal = ({ isOpen, epaper, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        date: '',
        page_number: 1
    });
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // ✅ Calculate max date (7 days ahead)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        return maxDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (epaper) {
            setFormData({
                date: epaper.date || '',
                page_number: epaper.page_number || 1
            });
            setImagePreview(getImageUrl(epaper) || '');
            setNewImage(null);
        }
    }, [epaper]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            const preview = await compressImage(file, 400, 0.6);
            setImagePreview(preview);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onSave(epaper.id, formData, newImage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const dateInfo = getDateInfo(formData.date);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">✏️ Edit E-Paper Page</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Image Preview & Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📷 Page Image
                        </label>
                        <div className="flex gap-4 items-start">
                            <div className="w-28 h-36 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span>No Image</span></div>';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FiImage size={28} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm text-gray-600 transition-colors"
                                >
                                    📷 Change Image
                                </button>
                                {newImage && (
                                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                        <FiCheckCircle size={12} />
                                        New image: {newImage.name}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    JPG, PNG, WEBP (max 10MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiCalendar className="inline mr-1" size={14} />
                            Edition Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={getMaxDate()}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {/* ✅ Show date info badge */}
                        {formData.date && (
                            <div className="mt-2">
                                {dateInfo.isFuture && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        ⏰ {formatRelativeDate(formData.date)}
                                    </span>
                                )}
                                {dateInfo.isToday && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        ✅ Today's Edition
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Page Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📄 Page Number
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.page_number}
                            onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==================== DELETE CONFIRMATION MODAL ====================
const DeleteConfirmModal = ({ isOpen, epaper, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    const imageUrl = getImageUrl(epaper);
    const dateInfo = getDateInfo(epaper?.date);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiTrash2 className="text-red-600" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Delete E-Paper Page?</h3>

                    {/* Preview Image */}
                    {imageUrl && (
                        <div className="w-20 h-28 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                                src={imageUrl}
                                alt="Page preview"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete this page?
                    </p>
                    <p className="font-medium text-gray-800 mb-2">
                        Page {epaper?.page_number || 1} •{' '}
                        {epaper?.date ? new Date(epaper.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }) : 'No date'}
                    </p>

                    {/* ✅ Show scheduled warning */}
                    {dateInfo.isFuture && (
                        <p className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg mb-2">
                            ⏰ This is a scheduled paper for future date
                        </p>
                    )}

                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        ⚠️ This action cannot be undone!
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <FiTrash2 size={16} />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== IMAGE UPLOADER COMPONENT ====================
const ImageUploader = ({ onUpload }) => {
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const onUploadRef = useRef(onUpload);

    useEffect(() => {
        onUploadRef.current = onUpload;
    }, [onUpload]);

    useEffect(() => {
        if (onUploadRef.current) {
            onUploadRef.current(images);
        }
    }, [images]);

    const validateImage = useCallback((file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: `${file.name}: Only JPG, PNG, WEBP allowed` };
        }
        if (file.size > maxSize) {
            return { valid: false, error: `${file.name}: Max 10MB allowed` };
        }
        return { valid: true };
    }, []);

    const processFiles = useCallback(async (files) => {
        const fileArray = Array.from(files);
        const newErrors = [];
        const newImages = [];

        setIsProcessing(true);

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const validation = validateImage(file);

            if (validation.valid) {
                try {
                    const compressedPreview = await compressImage(file, 800, 0.6);
                    newImages.push({
                        id: `img-${Date.now()}-${i}`,
                        file,
                        name: file.name,
                        size: file.size,
                        preview: compressedPreview,
                        pageNumber: 0
                    });
                } catch (err) {
                    newErrors.push(`${file.name}: Failed to process`);
                }
            } else {
                newErrors.push(validation.error);
            }
        }

        setImages(prev => {
            const updated = [...prev, ...newImages].map((img, idx) => ({
                ...img,
                pageNumber: idx + 1
            }));
            return updated;
        });

        if (newErrors.length > 0) {
            setErrors(prev => [...prev, ...newErrors]);
            setTimeout(() => setErrors([]), 5000);
        }

        setIsProcessing(false);
    }, [validateImage]);

    const handleFileChange = useCallback((e) => {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        e.target.value = '';
    }, [processFiles]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeImage = useCallback((id) => {
        setImages(prev => {
            const updated = prev.filter(img => img.id !== id).map((img, idx) => ({
                ...img,
                pageNumber: idx + 1
            }));
            return updated;
        });
    }, []);

    const clearAll = useCallback(() => {
        setImages([]);
    }, []);

    const handleDragStart = useCallback((e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOverItem = useCallback((e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setImages(prev => {
            const updated = [...prev];
            const [removed] = updated.splice(draggedIndex, 1);
            updated.splice(index, 0, removed);
            return updated.map((img, idx) => ({ ...img, pageNumber: idx + 1 }));
        });
        setDraggedIndex(index);
    }, [draggedIndex]);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
    }, []);

    const handleAddClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="space-y-4">
            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                        <FiAlertCircle size={16} />
                        <span>Upload Errors:</span>
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, idx) => <li key={idx}>• {error}</li>)}
                    </ul>
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleAddClick}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {isProcessing ? (
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiUpload size={28} />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 text-lg">
                            {isProcessing ? 'Processing Images...' : isDragging ? 'Drop images here!' : 'Drag & Drop E-Paper Pages'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or click to browse • JPG, PNG, WEBP (max 10MB each)
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${images.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {images.length} {images.length === 1 ? 'page' : 'pages'} selected
                    </div>
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-700">Pages ({images.length})</h3>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <FiCheckCircle size={10} />
                                Ready to upload
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearAll(); }}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <FiX size={14} /> Clear All
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <FiMove size={12} /> Drag to reorder pages
                    </p>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOverItem(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`relative group cursor-move transition-transform ${draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
                                    }`}
                            >
                                <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 shadow-sm">
                                    <img
                                        src={image.preview}
                                        alt={`Page ${image.pageNumber}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs text-center py-1 rounded-b-lg font-bold">
                                    {image.pageNumber}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}

                        {/* Add More Button */}
                        <div
                            onClick={handleAddClick}
                            className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <FiImage className="text-gray-400" size={20} />
                            <span className="text-xs text-gray-400 mt-1">Add More</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== UPLOAD PROGRESS MODAL ====================
const UploadProgressModal = ({ isOpen, progress, onClose }) => {
    if (!isOpen) return null;

    const { phase, currentPage, totalPages, fileName, fileProgress, overallProgress, summary } = progress;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-center">
                    {phase === 'complete' ? '✅ Upload Complete!' : '📤 Uploading E-Paper...'}
                </h3>

                {phase !== 'complete' ? (
                    <>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Page {currentPage} of {totalPages}</span>
                                <span className="font-bold text-blue-600">{overallProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300 relative"
                                    style={{ width: `${overallProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        {fileName && (
                            <p className="text-sm text-gray-500 truncate text-center bg-gray-50 px-3 py-2 rounded-lg">
                                📄 {fileName} {fileProgress !== undefined && `(${fileProgress}%)`}
                            </p>
                        )}
                        <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
                            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="font-medium">Please wait...</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center gap-8 mb-6">
                            <div className="text-center bg-green-50 px-6 py-4 rounded-xl">
                                <div className="text-4xl font-bold text-green-600">{summary?.success || 0}</div>
                                <div className="text-sm text-green-600 font-medium">Uploaded</div>
                            </div>
                            {summary?.failed > 0 && (
                                <div className="text-center bg-red-50 px-6 py-4 rounded-xl">
                                    <div className="text-4xl font-bold text-red-600">{summary.failed}</div>
                                    <div className="text-sm text-red-600 font-medium">Failed</div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                        >
                            Done
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const ManageEpaper = () => {
    // ===== STATE =====
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [uploadedPages, setUploadedPages] = useState([]);
    const [savedEpapers, setSavedEpapers] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('all');
    const [filterType, setFilterType] = useState('all'); // ✅ NEW: Filter by type
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('upload');
    const [uploaderKey, setUploaderKey] = useState(0);
    const [uploadProgress, setUploadProgress] = useState({});
    const [showProgressModal, setShowProgressModal] = useState(false);

    // ✅ Edit & Delete Modal States
    const [editModal, setEditModal] = useState({ isOpen: false, epaper: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, epaper: null, isDeleting: false });

    // ✅ Calculate max date (7 days ahead for scheduling)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        return maxDate.toISOString().split('T')[0];
    };

    // ✅ Get tomorrow's date
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // ✅ Show Message
    const showMessage = useCallback((type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }, []);

    // ✅ Load Saved Epapers
    const loadSavedEpapers = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('📥 Loading epapers...');
            const result = await epaperApi.getAll();

            if (result.success) {
                console.log('✅ Epapers loaded:', result.data?.length || 0);

                if (result.data?.length > 0) {
                    console.log('📄 Sample epaper:', result.data[0]);
                    console.log('🖼️ Image path:', result.data[0].image);
                    console.log('🔗 Full URL:', getImageUrl(result.data[0]));
                }

                setSavedEpapers(result.data || []);
            } else {
                console.error('❌ Failed to load epapers:', result.error);
                showMessage('error', 'Failed to load e-papers');
                setSavedEpapers([]);
            }
        } catch (error) {
            console.error('❌ Error loading epapers:', error);
            showMessage('error', 'Error loading e-papers');
            setSavedEpapers([]);
        } finally {
            setIsLoading(false);
        }
    }, [showMessage]);

    // ===== EFFECTS =====
    useEffect(() => {
        loadSavedEpapers();
    }, [loadSavedEpapers]);

    // ===== HANDLERS =====
    const handleImageUpload = useCallback((images) => {
        setUploadedPages(images);
    }, []);

    // ✅ Save/Upload Handler
    const handleSave = async () => {
        if (uploadedPages.length === 0) {
            showMessage('error', 'Please upload at least one page!');
            return;
        }

        const dateInfo = getDateInfo(selectedDate);
        const isScheduled = dateInfo.isFuture;

        setIsUploading(true);
        setShowProgressModal(true);
        setUploadProgress({
            phase: 'uploading',
            currentPage: 0,
            totalPages: uploadedPages.length,
            overallProgress: 0
        });

        try {
            const files = uploadedPages.map(page => page.file);

            const result = await epaperApi.uploadMultiplePages(
                selectedDate,
                files,
                null,
                (progress) => setUploadProgress(progress)
            );

            if (result.success) {
                const successMsg = isScheduled
                    ? `⏰ E-Paper scheduled for ${formatRelativeDate(selectedDate)}! (${result.summary.success} pages)`
                    : `✅ E-Paper uploaded successfully! (${result.summary.success} pages)`;
                showMessage('success', successMsg);
                setUploadedPages([]);
                setUploaderKey(prev => prev + 1);
                await loadSavedEpapers();
            } else if (result.partial) {
                showMessage('warning', `⚠️ Partial upload: ${result.summary.success} success, ${result.summary.failed} failed`);
                await loadSavedEpapers();
            } else {
                showMessage('error', `❌ Upload failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Save error:', error);
            showMessage('error', '❌ Error: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // ✅ Handle Edit Save
    const handleEditSave = async (id, formData, newImage) => {
        try {
            let result;

            if (newImage) {
                result = await epaperApi.updatePage(
                    id,
                    formData.date,
                    formData.page_number,
                    newImage,
                    null
                );
            } else {
                result = await epaperApi.update(id, {
                    date: formData.date,
                    page_number: formData.page_number
                });
            }

            if (result.success) {
                showMessage('success', '✅ E-Paper updated successfully!');
                setEditModal({ isOpen: false, epaper: null });
                await loadSavedEpapers();
            } else {
                showMessage('error', `❌ Update failed: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Edit save error:', error);
            showMessage('error', '❌ Error: ' + error.message);
        }
    };

    // ✅ Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        const id = deleteModal.epaper?.id;
        if (!id) return;

        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const result = await epaperApi.delete(id);

            if (result.success) {
                showMessage('success', '✅ E-Paper deleted successfully!');
                setDeleteModal({ isOpen: false, epaper: null, isDeleting: false });
                await loadSavedEpapers();
            } else {
                showMessage('error', `❌ Delete failed: ${result.error}`);
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            showMessage('error', '❌ Error: ' + error.message);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    };

    // ✅ Open Edit Modal
    const editEpaper = useCallback((epaper) => {
        setEditModal({ isOpen: true, epaper });
    }, []);

    // ✅ Open Delete Modal
    const deleteEpaper = useCallback((epaper) => {
        setDeleteModal({ isOpen: true, epaper, isDeleting: false });
    }, []);

    // ✅ Preview E-Paper
    const previewEpaper = useCallback((epaper) => {
        const imageUrl = getImageUrl(epaper);
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        } else {
            showMessage('error', 'No image available to preview');
        }
    }, [showMessage]);

    const handleDateChange = useCallback((e) => {
        setSelectedDate(e.target.value);
    }, []);

    const handleRefresh = useCallback(async () => {
        await loadSavedEpapers();
        showMessage('info', '🔄 Refreshed!');
    }, [loadSavedEpapers, showMessage]);

    // ===== COMPUTED =====
    const uniqueDates = [...new Set(savedEpapers.map(e => e.date).filter(Boolean))].sort().reverse();

    // ✅ Filter by date and type
    let filteredEpapers = filterDate === 'all'
        ? savedEpapers
        : savedEpapers.filter(e => e.date === filterDate);

    // ✅ Apply type filter (scheduled/published/all)
    if (filterType === 'scheduled') {
        filteredEpapers = filteredEpapers.filter(e => getDateInfo(e.date).isFuture);
    } else if (filterType === 'published') {
        filteredEpapers = filteredEpapers.filter(e => !getDateInfo(e.date).isFuture);
    }

    // Sort by date (newest first) then by page number
    const sortedEpapers = [...filteredEpapers].sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
        return (a.page_number || 0) - (b.page_number || 0);
    });

    // ✅ Stats with scheduled count
    const scheduledCount = savedEpapers.filter(e => getDateInfo(e.date).isFuture).length;
    const publishedCount = savedEpapers.length - scheduledCount;

    const stats = {
        totalPages: savedEpapers.length,
        totalDates: uniqueDates.length,
        latestDate: uniqueDates[0] || null,
        scheduledCount,
        publishedCount
    };

    // ✅ Get selected date info
    const selectedDateInfo = getDateInfo(selectedDate);

    // ===== RENDER =====
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        📰 E-Paper Management
                    </h1>
                    <p className="text-gray-500 mt-1">Upload and manage newspaper pages</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <a
                        href="/epaper"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiEye size={16} /> View E-Paper
                    </a>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in
                    ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                    ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                    ${message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                    ${message.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}
                `}>
                    {message.type === 'success' && <FiCheckCircle size={20} />}
                    {message.type === 'error' && <FiAlertCircle size={20} />}
                    {message.type === 'info' && <FiRefreshCw size={20} />}
                    {message.type === 'warning' && <FiAlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* ✅ Stats - Updated with Scheduled count */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="text-4xl font-bold">{stats.totalPages}</div>
                    <div className="text-blue-100 mt-1 font-medium">Total Pages</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="text-4xl font-bold">{stats.publishedCount}</div>
                    <div className="text-green-100 mt-1 font-medium">Published</div>
                </div>
                {/* ✅ NEW: Scheduled Papers Count */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="text-4xl font-bold">{stats.scheduledCount}</div>
                    <div className="text-purple-100 mt-1 font-medium">⏰ Scheduled</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-5 shadow-lg">
                    <div className="text-xl font-bold">
                        {stats.latestDate
                            ? new Date(stats.latestDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                            })
                            : 'No Data'
                        }
                    </div>
                    <div className="text-orange-100 mt-1 font-medium">Latest Edition</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="flex border-b">
                    {[
                        { id: 'upload', label: 'Upload New', icon: FiUpload },
                        { id: 'manage', label: 'Manage E-Papers', icon: FiImage },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.id === 'manage' && savedEpapers.length > 0 && (
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                    {savedEpapers.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* ==================== UPLOAD TAB ==================== */}
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            {/* ✅ Date Selector with Quick Buttons */}
                            <div className="max-w-lg">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FiCalendar size={14} />
                                    Select Edition Date *
                                </label>

                                {/* ✅ Quick Date Buttons */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedDateInfo.isToday
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        📅 Today
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDate(getTomorrowDate())}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedDateInfo.isTomorrow
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                            }`}
                                    >
                                        ⏰ Tomorrow
                                    </button>
                                </div>

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    max={getMaxDate()}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                                />

                                {/* ✅ Date Info Badge */}
                                <div className="mt-3 space-y-2">
                                    {selectedDateInfo.isToday && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                            ✅ Today's Edition - Will be published immediately
                                        </div>
                                    )}
                                    {selectedDateInfo.isTomorrow && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                            ⏰ Tomorrow's Edition - Will be scheduled for tomorrow
                                        </div>
                                    )}
                                    {selectedDateInfo.isFuture && !selectedDateInfo.isTomorrow && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                            ⏰ Future Edition - Will be scheduled for {new Date(selectedDate).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                    )}
                                    {selectedDateInfo.isPast && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                                            📁 Past Edition - Uploading for archive
                                        </div>
                                    )}
                                </div>

                                {savedEpapers.some(e => e.date === selectedDate) && (
                                    <p className="mt-3 text-sm text-yellow-600 flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                                        <FiAlertCircle size={14} />
                                        Pages exist for this date. New pages will be added.
                                    </p>
                                )}
                            </div>

                            {/* Image Uploader */}
                            <ImageUploader
                                key={uploaderKey}
                                onUpload={handleImageUpload}
                            />

                            {/* ✅ Save Button - Updated text based on date */}
                            {uploadedPages.length > 0 && (
                                <button
                                    onClick={handleSave}
                                    disabled={isUploading}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg transition-all transform hover:scale-[1.01] ${selectedDateInfo.isFuture
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : selectedDateInfo.isFuture ? (
                                        <>
                                            <FiClock size={22} />
                                            Schedule E-Paper ({uploadedPages.length} {uploadedPages.length === 1 ? 'page' : 'pages'})
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={22} />
                                            Upload E-Paper ({uploadedPages.length} {uploadedPages.length === 1 ? 'page' : 'pages'})
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Instructions */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    📝 How to Upload E-Paper
                                </h4>
                                <ol className="text-sm text-blue-700 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                        Select the edition date (Today, Tomorrow, or any future date up to 7 days)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                        Upload newspaper page images (drag & drop or click)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                        Drag to reorder pages if needed
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                        Click "Upload" or "Schedule" to save
                                    </li>
                                </ol>
                                {/* ✅ Scheduling Info */}
                                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                                    <p className="text-sm text-purple-800">
                                        <strong>⏰ Schedule Feature:</strong> Select tomorrow's date or any future date to schedule the paper in advance. It will be available to readers on the selected date.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== MANAGE TAB ==================== */}
                    {activeTab === 'manage' && (
                        <div className="space-y-4">
                            {/* ✅ Filters - Added Type Filter */}
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Type Filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-medium">Status:</span>
                                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                        {[
                                            { id: 'all', label: 'All', count: savedEpapers.length },
                                            { id: 'published', label: '✅ Published', count: stats.publishedCount },
                                            { id: 'scheduled', label: '⏰ Scheduled', count: stats.scheduledCount },
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFilterType(type.id)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === type.id
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                {type.label} ({type.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Filter */}
                                <div className="flex items-center gap-2">
                                    <FiFilter size={16} className="text-gray-500" />
                                    <span className="text-sm text-gray-600 font-medium">Date:</span>
                                    <select
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                                    >
                                        <option value="all">All Dates</option>
                                        {uniqueDates.map(date => {
                                            const info = getDateInfo(date);
                                            const pageCount = savedEpapers.filter(e => e.date === date).length;
                                            return (
                                                <option key={date} value={date}>
                                                    {info.isToday ? '📅 Today' : info.isTomorrow ? '⏰ Tomorrow' : info.isFuture ? '⏰ ' : ''}
                                                    {new Date(date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })} ({pageCount} pages)
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading e-papers...</p>
                                </div>
                            ) : sortedEpapers.length === 0 ? (
                                /* Empty State */
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiImage size={40} className="text-gray-400" />
                                    </div>
                                    <p className="text-xl font-medium text-gray-600">
                                        {filterType === 'scheduled' ? 'No scheduled e-papers' :
                                            filterType === 'published' ? 'No published e-papers' :
                                                'No e-papers found'}
                                    </p>
                                    <p className="text-gray-400 mt-2">
                                        {filterType === 'scheduled'
                                            ? 'Schedule your first e-paper for tomorrow!'
                                            : 'Upload your first e-paper using the Upload tab'}
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <FiUpload className="inline mr-2" size={16} />
                                        Upload Now
                                    </button>
                                </div>
                            ) : (
                                /* E-Paper Grid */
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {sortedEpapers.map((epaper) => {
                                        const imageUrl = getImageUrl(epaper);
                                        const dateInfo = getDateInfo(epaper.date);

                                        return (
                                            <div
                                                key={epaper.id}
                                                className={`bg-white rounded-xl overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group ${dateInfo.isFuture
                                                    ? 'border-purple-200 hover:border-purple-400'
                                                    : 'border-gray-100 hover:border-blue-300'
                                                    }`}
                                            >
                                                {/* ✅ Image Display */}
                                                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Page ${epaper.page_number || 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                console.log('❌ Image load failed:', imageUrl);
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                e.target.nextElementSibling.style.display = 'flex';
                                                            }}
                                                            loading="lazy"
                                                        />
                                                    ) : null}
                                                    {/* Fallback when no image or image fails */}
                                                    <div
                                                        className={`w-full h-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 ${imageUrl ? 'hidden' : 'flex'}`}
                                                    >
                                                        <FiImage size={32} />
                                                        <span className="text-xs mt-2">No Image</span>
                                                    </div>

                                                    {/* Page Number Badge */}
                                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                                        Page {epaper.page_number || 1}
                                                    </div>

                                                    {/* ✅ Scheduled Badge */}
                                                    {dateInfo.isFuture && (
                                                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold backdrop-blur-sm flex items-center gap-1">
                                                            <FiClock size={10} />
                                                            {dateInfo.isTomorrow ? 'Tomorrow' : 'Scheduled'}
                                                        </div>
                                                    )}

                                                    {/* ✅ Today Badge */}
                                                    {dateInfo.isToday && (
                                                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                                            Today
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-3">
                                                    <p className={`text-sm font-medium flex items-center gap-1 ${dateInfo.isFuture ? 'text-purple-700' : 'text-gray-700'
                                                        }`}>
                                                        <FiCalendar size={12} className={dateInfo.isFuture ? 'text-purple-500' : 'text-gray-400'} />
                                                        {dateInfo.isToday ? "Today's Edition" :
                                                            dateInfo.isTomorrow ? "Tomorrow's Edition" :
                                                                epaper.date
                                                                    ? new Date(epaper.date).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })
                                                                    : 'No date'
                                                        }
                                                    </p>
                                                    {epaper.created_at && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                            <FiClock size={10} />
                                                            Added {new Date(epaper.created_at).toLocaleDateString()}
                                                        </p>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-1 mt-3">
                                                        <button
                                                            onClick={() => previewEpaper(epaper)}
                                                            className="flex-1 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                            title="View full size"
                                                        >
                                                            <FiEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => editEpaper(epaper)}
                                                            className="flex-1 px-2 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteEpaper(epaper)}
                                                            className="flex-1 px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Edit Modal */}
            <EditEpaperModal
                isOpen={editModal.isOpen}
                epaper={editModal.epaper}
                onClose={() => setEditModal({ isOpen: false, epaper: null })}
                onSave={handleEditSave}
            />

            {/* ✅ Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                epaper={deleteModal.epaper}
                onClose={() => setDeleteModal({ isOpen: false, epaper: null, isDeleting: false })}
                onConfirm={handleDeleteConfirm}
                isDeleting={deleteModal.isDeleting}
            />

            {/* ✅ Upload Progress Modal */}
            <UploadProgressModal
                isOpen={showProgressModal}
                progress={uploadProgress}
                onClose={() => setShowProgressModal(false)}
            />

            {/* CSS for animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ManageEpaper;