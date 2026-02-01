// src/components/epaper/ImageUploader.jsx
import { useState, useRef, useCallback } from 'react';
import {
    FiUpload,
    FiImage,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiMove,
    FiLoader,
    FiCloud,
    FiCheckCircle,
} from 'react-icons/fi';
import uploadApi from '../../api/uploadApi';

const ImageUploader = ({
    onUpload,
    onUploadComplete,
    maxPages = 32,
    expectedPages = null,
    editionName = 'E-Paper',
    editionId = null,
    autoUpload = false, // If true, upload to server immediately
    folder = 'epaper',
}) => {
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedCount, setUploadedCount] = useState(0);
    const fileInputRef = useRef(null);

    // Validate image file
    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: `${file.name}: Only JPG, PNG, WEBP allowed` };
        }

        if (file.size > maxSize) {
            return { valid: false, error: `${file.name}: File too large (max 5MB)` };
        }

        return { valid: true };
    };

    // Process uploaded files
    const processFiles = useCallback(
        async (files) => {
            const fileArray = Array.from(files);
            const newErrors = [];
            const validImages = [];

            // Check max pages limit
            if (images.length + fileArray.length > maxPages) {
                newErrors.push(`Maximum ${maxPages} pages allowed`);
                setErrors(newErrors);
                setTimeout(() => setErrors([]), 5000);
                return;
            }

            // Validate all files first
            fileArray.forEach((file) => {
                const validation = validateImage(file);
                if (validation.valid) {
                    validImages.push(file);
                } else {
                    newErrors.push(validation.error);
                }
            });

            if (newErrors.length > 0) {
                setErrors((prev) => [...prev, ...newErrors]);
                setTimeout(() => setErrors([]), 5000);
            }

            if (validImages.length === 0) return;

            // If autoUpload is enabled, upload to server
            if (autoUpload) {
                await uploadToServer(validImages);
            } else {
                // Just add to local state with previews
                addLocalPreviews(validImages);
            }
        },
        [images, maxPages, autoUpload]
    );

    // Add local previews (without server upload)
    const addLocalPreviews = (files) => {
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = {
                    id: `img-${Date.now()}-${index}`,
                    file: file,
                    name: file.name,
                    size: file.size,
                    preview: e.target.result,
                    pageNumber: images.length + index + 1,
                    uploaded: false,
                    url: null,
                    fileId: null,
                };

                setImages((prev) => {
                    const updated = [...prev, newImage].map((img, idx) => ({
                        ...img,
                        pageNumber: idx + 1,
                    }));

                    if (onUpload) {
                        onUpload(updated);
                    }

                    return updated;
                });
            };
            reader.readAsDataURL(file);
        });
    };

    // Upload files to server
    const uploadToServer = async (files) => {
        setUploading(true);
        setUploadProgress(0);
        setUploadedCount(0);

        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Create preview first
            const preview = await createPreview(file);

            // Upload to server
            const result = await uploadApi.uploadImage(
                file,
                folder,
                (progress) => {
                    const overallProgress = Math.round(
                        ((i * 100 + progress) / files.length)
                    );
                    setUploadProgress(overallProgress);
                }
            );

            const newImage = {
                id: `img-${Date.now()}-${i}`,
                file: file,
                name: file.name,
                size: file.size,
                preview: preview,
                pageNumber: images.length + i + 1,
                uploaded: result.success,
                url: result.url || null,
                fileId: result.fileId || null,
                error: result.error || null,
            };

            results.push(newImage);
            setUploadedCount(i + 1);
        }

        setImages((prev) => {
            const updated = [...prev, ...results].map((img, idx) => ({
                ...img,
                pageNumber: idx + 1,
            }));

            if (onUpload) {
                onUpload(updated);
            }

            if (onUploadComplete) {
                const uploadedImages = results.filter((r) => r.uploaded);
                onUploadComplete(uploadedImages);
            }

            return updated;
        });

        setUploading(false);
        setUploadProgress(100);

        // Show errors for failed uploads
        const failedUploads = results.filter((r) => !r.uploaded);
        if (failedUploads.length > 0) {
            setErrors(failedUploads.map((f) => `${f.name}: ${f.error || 'Upload failed'}`));
            setTimeout(() => setErrors([]), 5000);
        }
    };

    // Create preview from file
    const createPreview = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    // Upload all pending images to server
    const uploadAllToServer = async () => {
        const pendingImages = images.filter((img) => !img.uploaded && img.file);

        if (pendingImages.length === 0) {
            setErrors(['No pending images to upload']);
            setTimeout(() => setErrors([]), 3000);
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadedCount(0);

        const updatedImages = [...images];

        for (let i = 0; i < pendingImages.length; i++) {
            const img = pendingImages[i];
            const imgIndex = updatedImages.findIndex((item) => item.id === img.id);

            const result = await uploadApi.uploadImage(
                img.file,
                folder,
                (progress) => {
                    const overallProgress = Math.round(((i * 100 + progress) / pendingImages.length));
                    setUploadProgress(overallProgress);
                }
            );

            if (imgIndex !== -1) {
                updatedImages[imgIndex] = {
                    ...updatedImages[imgIndex],
                    uploaded: result.success,
                    url: result.url || null,
                    fileId: result.fileId || null,
                    error: result.error || null,
                };
            }

            setUploadedCount(i + 1);
        }

        setImages(updatedImages);

        if (onUpload) {
            onUpload(updatedImages);
        }

        if (onUploadComplete) {
            const successfulUploads = updatedImages.filter((img) => img.uploaded);
            onUploadComplete(successfulUploads);
        }

        setUploading(false);
        setUploadProgress(100);

        // Show success/error message
        const successCount = updatedImages.filter((img) => img.uploaded).length;
        const failedCount = updatedImages.filter((img) => !img.uploaded).length;

        if (failedCount > 0) {
            setErrors([`${failedCount} image(s) failed to upload`]);
            setTimeout(() => setErrors([]), 5000);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        e.target.value = '';
    };

    // Handle drag & drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    // Remove single image
    const removeImage = async (id) => {
        const imageToRemove = images.find((img) => img.id === id);

        // If uploaded to server, delete from server too
        if (imageToRemove?.fileId) {
            await uploadApi.deleteFile(imageToRemove.fileId);
        }

        setImages((prev) => {
            const updated = prev
                .filter((img) => img.id !== id)
                .map((img, idx) => ({ ...img, pageNumber: idx + 1 }));

            if (onUpload) {
                onUpload(updated);
            }

            return updated;
        });
    };

    // Clear all images
    const clearAll = async () => {
        // Delete uploaded files from server
        const uploadedImages = images.filter((img) => img.fileId);
        if (uploadedImages.length > 0) {
            await Promise.all(
                uploadedImages.map((img) => uploadApi.deleteFile(img.fileId))
            );
        }

        setImages([]);
        if (onUpload) {
            onUpload([]);
        }
    };

    // Drag reorder handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOverItem = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setImages((prev) => {
            const updated = [...prev];
            const [removed] = updated.splice(draggedIndex, 1);
            updated.splice(index, 0, removed);

            const renumbered = updated.map((img, idx) => ({
                ...img,
                pageNumber: idx + 1,
            }));

            if (onUpload) {
                onUpload(renumbered);
            }

            return renumbered;
        });

        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Check if page count matches expected
    const isValidCount = expectedPages ? images.length === expectedPages : true;
    const pendingCount = images.filter((img) => !img.uploaded).length;
    const uploadedImagesCount = images.filter((img) => img.uploaded).length;

    return (
        <div className="space-y-4">
            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                        <FiAlertCircle size={18} />
                        <span>Errors:</span>
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <FiLoader className="animate-spin text-blue-600" size={20} />
                        <span className="font-medium text-blue-800">
                            Uploading... ({uploadedCount}/{images.filter((i) => !i.uploaded).length + uploadedCount})
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-blue-600 mt-2">{uploadProgress}% complete</p>
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
          border-3 border-dashed rounded-2xl p-8 text-center transition-all
          ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                    }
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center gap-3">
                    <div
                        className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-colors
              ${isDragging ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
            `}
                    >
                        <FiUpload size={28} />
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-gray-700">
                            {isDragging ? 'Drop images here!' : 'Drag & Drop Images'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or click to browse • JPG, PNG, WEBP (max 5MB each)
                        </p>
                    </div>

                    {expectedPages && (
                        <div
                            className={`
                px-4 py-2 rounded-full text-sm font-medium
                ${isValidCount
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
              `}
                        >
                            {images.length} / {expectedPages} pages for {editionName}
                        </div>
                    )}
                </div>
            </div>

            {/* Uploaded Images Grid */}
            {images.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-gray-700">
                                Pages ({images.length})
                            </h3>

                            {/* Upload Status Badges */}
                            {uploadedImagesCount > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <FiCheckCircle size={12} />
                                    {uploadedImagesCount} uploaded
                                </span>
                            )}

                            {pendingCount > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                    <FiCloud size={12} />
                                    {pendingCount} pending
                                </span>
                            )}

                            {expectedPages && (
                                <span
                                    className={`
                    flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${isValidCount
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }
                  `}
                                >
                                    {isValidCount ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
                                    {isValidCount ? 'Complete' : `Need ${expectedPages} pages`}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Upload All Button */}
                            {!autoUpload && pendingCount > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        uploadAllToServer();
                                    }}
                                    disabled={uploading}
                                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <FiCloud size={14} />
                                    Upload All
                                </button>
                            )}

                            {/* Clear All Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAll();
                                }}
                                disabled={uploading}
                                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                            >
                                <FiX size={14} />
                                Clear All
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <FiMove size={12} />
                        Drag to reorder pages
                    </p>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                draggable={!uploading}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOverItem(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`
                  relative group transition-all
                  ${uploading ? 'cursor-not-allowed' : 'cursor-move'}
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
                            >
                                <div
                                    className={`
                    aspect-[3/4] bg-white rounded-lg overflow-hidden border-2 transition-colors shadow-sm
                    ${image.uploaded
                                            ? 'border-green-400'
                                            : image.error
                                                ? 'border-red-400'
                                                : 'border-gray-200 group-hover:border-primary'
                                        }
                  `}
                                >
                                    <img
                                        src={image.preview}
                                        alt={`Page ${image.pageNumber}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />

                                    {/* Upload Status Overlay */}
                                    {image.uploaded && (
                                        <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                                            <FiCheckCircle size={10} />
                                        </div>
                                    )}

                                    {image.error && (
                                        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                            <FiAlertCircle size={10} />
                                        </div>
                                    )}
                                </div>

                                {/* Page Number */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs text-center py-1.5 rounded-b-lg font-medium">
                                    Page {image.pageNumber}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(image.id);
                                    }}
                                    disabled={uploading}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    <FiX size={12} />
                                </button>

                                {/* Drag Handle */}
                                <div className="absolute top-1 left-1 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiMove size={10} />
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        {images.length < maxPages && (
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`
                  aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center transition-all
                  ${uploading
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer hover:border-primary hover:bg-primary/5'
                                    }
                `}
                            >
                                <FiImage className="text-gray-400" size={20} />
                                <span className="text-xs text-gray-400 mt-1">Add</span>
                            </div>
                        )}
                    </div>

                    {/* File Size Info */}
                    <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                            Total: {(images.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span>
                            {uploadedImagesCount} uploaded • {pendingCount} pending
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;