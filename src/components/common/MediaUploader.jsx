// src/components/common/MediaUploader.jsx
// General purpose image/video uploader for news articles, etc.
import { useState, useRef } from 'react';
import {
    FiUpload,
    FiImage,
    FiVideo,
    FiX,
    FiLoader,
    FiCheckCircle,
    FiAlertCircle,
} from 'react-icons/fi';
import uploadApi from '../../api/uploadApi';

const MediaUploader = ({
    type = 'image', // 'image' | 'video' | 'both'
    multiple = false,
    maxFiles = 10,
    folder = 'uploads',
    onUpload, // Called with uploaded file(s) data
    onError,
    showPreview = true,
    className = '',
    placeholder = null,
}) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    // Get accept types based on type prop
    const getAcceptTypes = () => {
        switch (type) {
            case 'video':
                return 'video/mp4,video/webm,video/ogg,video/quicktime';
            case 'both':
                return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
            case 'all':
                return '*/*'; // Accept all file types
            default:
                return 'image/jpeg,image/png,image/webp,image/gif';
        }
    };

    // Handle file selection
    const handleFiles = async (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);

        if (!multiple && fileArray.length > 1) {
            fileArray.length = 1;
        }

        if (files.length + fileArray.length > maxFiles) {
            onError?.(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const results = [];

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const isVideo = file.type.startsWith('video/');

            // Create preview
            const preview = await createPreview(file);

            // Upload to server
            const uploadFn = isVideo ? uploadApi.uploadVideo : uploadApi.uploadImage;
            const result = await uploadFn(file, folder, (progress) => {
                const overall = Math.round(((i * 100 + progress) / fileArray.length));
                setUploadProgress(overall);
            });

            if (result.success) {
                results.push({
                    id: `file-${Date.now()}-${i}`,
                    name: file.name,
                    size: file.size,
                    type: isVideo ? 'video' : 'image',
                    preview,
                    url: result.url,
                    fileId: result.fileId,
                });
            } else {
                onError?.(result.error || `Failed to upload ${file.name}`);
            }
        }

        setUploading(false);
        setUploadProgress(100);

        if (multiple) {
            setFiles((prev) => [...prev, ...results]);
            onUpload?.([...files, ...results]);
        } else {
            setFiles(results);
            onUpload?.(results[0] || null);
        }
    };

    // Create preview
    const createPreview = (file) => {
        return new Promise((resolve) => {
            if (file.type.startsWith('video/')) {
                // For video, create a thumbnail
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    video.currentTime = 1;
                };
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    resolve(canvas.toDataURL());
                };
                video.onerror = () => resolve(null);
                video.src = URL.createObjectURL(file);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            }
        });
    };

    // Remove file
    const removeFile = async (fileId) => {
        const fileToRemove = files.find((f) => f.id === fileId);

        if (fileToRemove?.fileId) {
            await uploadApi.deleteFile(fileToRemove.fileId);
        }

        const updated = files.filter((f) => f.id !== fileId);
        setFiles(updated);
        onUpload?.(multiple ? updated : null);
    };

    // Drag handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all
          ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={getAcceptTypes()}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="space-y-2">
                        <FiLoader className="animate-spin mx-auto text-blue-500" size={32} />
                        <p className="text-sm text-blue-600">Uploading... {uploadProgress}%</p>
                        <div className="w-full max-w-xs mx-auto bg-blue-100 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : placeholder ? (
                    placeholder
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-center gap-2">
                            {(type === 'image' || type === 'both') && (
                                <FiImage className="text-gray-400" size={24} />
                            )}
                            {(type === 'video' || type === 'both') && (
                                <FiVideo className="text-gray-400" size={24} />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-400">
                            {type === 'image' && 'JPG, PNG, WEBP, GIF (max 10MB)'}
                            {type === 'video' && 'MP4, WEBM, MOV (max 100MB)'}
                            {type === 'both' && 'Images or Videos'}
                            {type === 'all' && 'All file formats accepted'}
                        </p>
                    </div>
                )}
            </div>

            {/* Preview Grid */}
            {showPreview && files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((file) => (
                        <div key={file.id} className="relative group">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                {file.preview ? (
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {file.type === 'video' ? (
                                            <FiVideo className="text-gray-400" size={24} />
                                        ) : (
                                            <FiImage className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                )}

                                {/* Type Badge */}
                                {file.type === 'video' && (
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                        Video
                                    </div>
                                )}

                                {/* Success indicator */}
                                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                                    <FiCheckCircle size={12} />
                                </div>
                            </div>

                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                            >
                                <FiX size={12} />
                            </button>

                            {/* File name */}
                            <p className="text-xs text-gray-500 truncate mt-1">{file.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaUploader;