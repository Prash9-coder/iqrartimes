// src/api/uploadApi.js
import api from './index';

/**
 * Aggressive image compression for upload
 * Ensures files stay under server limit
 */
const compressImageForUpload = (file, maxWidth = 1400, quality = 0.75, maxSizeKB = 750) => {
    return new Promise((resolve, reject) => {
        // Only compress standard image formats
        const compressibleTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!compressibleTypes.includes(file.type.toLowerCase())) {
            console.log('⏭️ Skipping compression for:', file.type);
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Recursive compression function
                const tryCompress = (currentWidth, currentQuality, attempt = 1) => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if larger than currentWidth
                    if (width > currentWidth) {
                        height = (height * currentWidth) / width;
                        width = currentWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    // Use better image rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Always output as JPEG for better compression (except transparent PNGs)
                    const outputType = 'image/jpeg';

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                console.log('⚠️ Compression failed, using original');
                                resolve(file);
                                return;
                            }

                            const sizeKB = blob.size / 1024;
                            console.log(`🔄 Attempt ${attempt}: ${sizeKB.toFixed(0)}KB (quality: ${currentQuality}, width: ${currentWidth})`);

                            // Check if under target size
                            if (sizeKB <= maxSizeKB) {
                                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                                    type: outputType,
                                    lastModified: Date.now()
                                });
                                console.log(`✅ Compressed: ${(file.size / 1024).toFixed(0)}KB → ${sizeKB.toFixed(0)}KB`);
                                resolve(compressedFile);
                            }
                            // Try again with lower quality/size
                            else if (attempt < 8) {
                                let newQuality = currentQuality - 0.1;
                                let newWidth = currentWidth;

                                // If quality is getting too low, reduce dimensions instead
                                if (newQuality < 0.4) {
                                    newQuality = 0.7;
                                    newWidth = Math.floor(currentWidth * 0.75);
                                }

                                tryCompress(newWidth, newQuality, attempt + 1);
                            }
                            // Give up and use best effort
                            else {
                                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                                    type: outputType,
                                    lastModified: Date.now()
                                });
                                console.log(`⚠️ Max attempts reached. Final size: ${sizeKB.toFixed(0)}KB`);
                                resolve(compressedFile);
                            }
                        },
                        outputType,
                        currentQuality
                    );
                };

                // Start compression
                tryCompress(maxWidth, quality);
            };
            img.onerror = () => {
                console.log('⚠️ Image load failed, using original');
                resolve(file);
            };
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
};

/**
 * Compress PNG with transparency support
 */
const compressPNGWithTransparency = (file, maxWidth = 1400, maxSizeKB = 750) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Check if image has transparency
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let hasTransparency = false;
                for (let i = 3; i < imageData.data.length; i += 4) {
                    if (imageData.data[i] < 255) {
                        hasTransparency = true;
                        break;
                    }
                }

                if (hasTransparency) {
                    // Keep as PNG for transparency
                    canvas.toBlob((blob) => {
                        if (blob && blob.size / 1024 <= maxSizeKB) {
                            resolve(new File([blob], file.name, { type: 'image/png' }));
                        } else {
                            // PNG too large, convert to JPEG anyway
                            resolve(compressImageForUpload(file, maxWidth, 0.75, maxSizeKB));
                        }
                    }, 'image/png');
                } else {
                    // No transparency, use JPEG compression
                    resolve(compressImageForUpload(file, maxWidth, 0.75, maxSizeKB));
                }
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
};

const uploadApi = {
    // Configuration - Server limit appears to be ~1MB
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB input limit
    MAX_UPLOAD_SIZE_KB: 750, // Target compressed size (under server's ~1MB limit)

    /**
     * Check if file is valid image
     */
    isValidImageType: (file) => {
        if (file.type && file.type.startsWith('image/')) {
            return true;
        }

        const imageExtensions = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
            'tiff', 'tif', 'ico', 'heic', 'heif', 'avif', 'apng',
            'jfif', 'pjpeg', 'pjp', 'raw', 'cr2', 'nef'
        ];

        const ext = file.name.split('.').pop()?.toLowerCase();
        return imageExtensions.includes(ext);
    },

    /**
     * Check if file is valid video
     */
    isValidVideoType: (file) => {
        if (file.type && file.type.startsWith('video/')) {
            return true;
        }

        const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        return videoExtensions.includes(ext);
    },

    /**
     * Format file size
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Upload file to server (S3)
     */
    upload: async (file, onProgress = null) => {
        try {
            // Validate input
            if (!file || !(file instanceof File)) {
                throw new Error('Invalid file provided');
            }

            console.log("📤 ===== FILE UPLOAD START =====");
            console.log("📤 Original File:", file.name);
            console.log("📤 Original Size:", uploadApi.formatFileSize(file.size));
            console.log("📤 MIME Type:", file.type || 'unknown');

            // VALIDATE FILE TYPE
            const isImage = uploadApi.isValidImageType(file);
            const isVideo = uploadApi.isValidVideoType(file);
            const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (!isImage && !isVideo && !isPDF) {
                throw new Error(`Invalid file type: ${file.type || file.name.split('.').pop()}. Supported: Images, Videos, PDF`);
            }

            // VALIDATE INITIAL FILE SIZE - 10MB
            if (file.size > uploadApi.MAX_FILE_SIZE) {
                const currentSize = uploadApi.formatFileSize(file.size);
                const maxSize = uploadApi.formatFileSize(uploadApi.MAX_FILE_SIZE);
                throw new Error(`File too large (${currentSize}). Maximum size is ${maxSize}.`);
            }

            // COMPRESS IMAGE - More aggressive compression
            let fileToUpload = file;
            const compressibleTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

            if (isImage && compressibleTypes.includes(file.type?.toLowerCase())) {
                const fileSizeKB = file.size / 1024;

                // Compress if over 500KB (to ensure we stay under server limit)
                if (fileSizeKB > 500) {
                    console.log("🔄 Compressing image to stay under server limit...");

                    if (file.type === 'image/png') {
                        fileToUpload = await compressPNGWithTransparency(file, 1400, uploadApi.MAX_UPLOAD_SIZE_KB);
                    } else {
                        fileToUpload = await compressImageForUpload(file, 1400, 0.75, uploadApi.MAX_UPLOAD_SIZE_KB);
                    }

                    console.log("📤 After Compression:", uploadApi.formatFileSize(fileToUpload.size));
                }
            }

            // FINAL SIZE CHECK - Warn if still large
            const finalSizeKB = fileToUpload.size / 1024;
            if (finalSizeKB > 900) {
                console.warn(`⚠️ Warning: File is ${finalSizeKB.toFixed(0)}KB, may exceed server limit`);
            }

            // Create FormData
            const formData = new FormData();
            formData.append('files', fileToUpload);

            console.log("📤 Uploading to: /user/storage/upload");
            console.log("📤 Final Upload Size:", uploadApi.formatFileSize(fileToUpload.size));

            const response = await api.post('/user/storage/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 180000, // 3 minutes timeout
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        console.log("📊 Upload Progress:", percent + "%");
                        onProgress(percent);
                    }
                },
            });

            console.log("✅ Full Response:", response.data);

            const apiResponse = response.data;

            if (!apiResponse.success) {
                const errorMsg = apiResponse.description || apiResponse.message || 'Upload failed';
                throw new Error(errorMsg);
            }

            // Handle ARRAY response
            if (apiResponse.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
                const uploadedFile = apiResponse.data[0];

                console.log("✅ Upload Successful!");
                console.log("🔗 File URL:", uploadedFile.file_url);

                return {
                    success: true,
                    url: uploadedFile.file_url,
                    path: uploadedFile.file_path,
                    filename: uploadedFile.original_filename,
                    data: uploadedFile,
                };
            }

            // Fallback for non-array response
            if (apiResponse.data && !Array.isArray(apiResponse.data)) {
                const fileUrl = apiResponse.data.file_url || apiResponse.data.url;
                if (fileUrl) {
                    return {
                        success: true,
                        url: fileUrl,
                        path: apiResponse.data.file_path || fileUrl,
                        data: apiResponse.data,
                    };
                }
            }

            throw new Error("No file URL returned from server");

        } catch (error) {
            console.error("❌ Upload Error:", error.message);
            console.error("❌ Error Response:", error.response?.data);

            // Better error messages
            let errorMsg = error.message || 'Upload failed';

            if (error.response?.status === 413) {
                errorMsg = 'File too large for server. Please use a smaller image.';
            } else if (error.message === 'Network Error') {
                errorMsg = 'Network error. The file may be too large or the connection was lost.';
            }

            return {
                success: false,
                error: errorMsg,
            };
        }
    },

    /**
     * Upload multiple files with retry logic
     */
    uploadMultiple: async (files, onProgress = null) => {
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`\n📁 Uploading file ${i + 1}/${files.length}: ${file.name}`);

            let result = await uploadApi.upload(file, (progress) => {
                if (onProgress) {
                    const overallProgress = Math.round(((i + progress / 100) / files.length) * 100);
                    onProgress(overallProgress);
                }
            });

            // Retry once on failure
            if (!result.success) {
                console.log(`🔄 Retrying file ${i + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                result = await uploadApi.upload(file, onProgress);
            }

            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }

            results.push(result);
        }

        console.log(`\n📊 Upload Complete: ✅ ${successCount} | ❌ ${failCount}`);
        return results;
    },

    /**
     * Delete uploaded file
     */
    delete: async (fileUrl) => {
        try {
            const response = await api.delete('/user/storage/delete', {
                data: { url: fileUrl }
            });
            return { success: response.data?.success || true };
        } catch (error) {
            console.error('❌ Delete error:', error);
            return { success: false, error: error.message };
        }
    }
};

export default uploadApi;