// src/components/admin/NewsEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Save, X, Upload, Loader2, Tag, Check, TrendingUp,
    ArrowLeft, AlertCircle, ImageOff, Eye
} from 'lucide-react';
import api from '../../api/index';
import categoryApi from '../../api/categoryApi';
import uploadApi from '../../api/uploadApi';

const NewsEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // States
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formErrors, setFormErrors] = useState({});
    const [tagInput, setTagInput] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        language: 'HINDI',
        categories: [],
        tags: [],
        image: '',
        is_trending: false,
        status: 'Pending'
    });

    // Constants - Only Hindi & English
    const languageOptions = [
        { value: 'HINDI', label: 'हिंदी (Hindi)' },
        { value: 'ENGLISH', label: 'English' },
    ];

    // Image Config - 10MB, All types
    const IMAGE_CONFIG = {
        maxSize: 10 * 1024 * 1024,
        maxSizeLabel: '10MB',
    };

    // Effects
    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchArticle(id);
        }
    }, [id]);

    // Show Message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const result = await categoryApi.getNewsCategories(formData.language);
            if (result.success) {
                setCategories(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fetch Article for Edit
    const fetchArticle = async (articleId) => {
        setLoading(true);
        try {
            const response = await api.get(`/backoffice/news/${articleId}`);

            if (response.data?.success && response.data?.data) {
                const article = response.data.data;

                // Extract category IDs
                const categoryIds = (article.categories || [])
                    .map(cat => {
                        if (typeof cat === 'string' || typeof cat === 'number') return cat;
                        if (typeof cat === 'object' && cat.id) return cat.id;
                        return null;
                    })
                    .filter(id => id !== null);

                setFormData({
                    title: article.title || '',
                    description: article.description || '',
                    language: article.language || 'HINDI',
                    categories: categoryIds,
                    tags: article.tags || [],
                    image: article.image || article.featured_image || '',
                    is_trending: article.is_trending || false,
                    status: article.status || 'Pending'
                });
                setImagePreview(article.image || article.featured_image || '');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            showMessage('error', 'Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (formData.tags.length === 0) errors.tags = 'At least one tag is required';
        if (formData.categories.length === 0) errors.categories = 'At least one category is required';

        const imageValue = typeof formData.image === 'string' ? formData.image.trim() : '';
        if (!imageValue) errors.image = 'Image is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Image Upload
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if valid image
        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Please upload an image file');
            return;
        }

        // Check file size - 10MB
        if (file.size > IMAGE_CONFIG.maxSize) {
            showMessage('error', `Image too large (${formatFileSize(file.size)})! Max ${IMAGE_CONFIG.maxSizeLabel}`);
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);
        setImageUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadApi.upload(file, (progress) => {
                setUploadProgress(progress);
            });

            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, image: result.url }));
                setImagePreview(result.url);
                if (formErrors.image) setFormErrors(prev => ({ ...prev, image: '' }));
                showMessage('success', 'Image uploaded successfully!');
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            showMessage('error', 'Upload failed: ' + error.message);
            setImagePreview('');
            setFormData(prev => ({ ...prev, image: '' }));
        } finally {
            setImageUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (localPreview.startsWith('blob:')) {
                URL.revokeObjectURL(localPreview);
            }
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, image: url }));
        setImagePreview(url);
        if (url.trim() && formErrors.image) {
            setFormErrors(prev => ({ ...prev, image: '' }));
        }
    };

    // Category Change
    const handleCategoryChange = (categoryId) => {
        setFormData(prev => {
            const isSelected = prev.categories.includes(categoryId);
            const newCategories = isSelected
                ? prev.categories.filter(c => c !== categoryId)
                : [...prev.categories, categoryId];
            return { ...prev, categories: newCategories };
        });

        if (formErrors.categories) {
            setFormErrors(prev => ({ ...prev, categories: '' }));
        }
    };

    // Tag Handling
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase();
            if (tag && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                if (formErrors.tags) setFormErrors(prev => ({ ...prev, tags: '' }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Submit Handler
    const handleSubmit = async (e, status = 'Pending') => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fix the form errors');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                language: formData.language,
                categories: formData.categories,
                tags: formData.tags,
                image: formData.image.trim(),
                is_trending: formData.is_trending,
                status: status
            };

            console.log('📤 Submitting:', payload);

            let response;
            if (id) {
                response = await api.patch(`/backoffice/news/${id}`, payload);
            } else {
                response = await api.post('/backoffice/news', payload);
            }

            if (response.data?.success) {
                showMessage('success', id ? '✅ Article updated!' : '✅ Article created!');
                setTimeout(() => navigate('/admin/news'), 1000);
            } else {
                showMessage('error', response.data?.description || 'Operation failed');
            }
        } catch (error) {
            console.error('❌ Submit error:', error);
            showMessage('error', error.response?.data?.description || error.message);
        } finally {
            setSaving(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading article...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/news')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {id ? '✏️ Edit Article' : '➕ Create Article'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {id ? 'Update your article details' : 'Fill in the details to create a new article'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <form onSubmit={(e) => handleSubmit(e, 'Pending')} className="p-6 space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                                }}
                                maxLength={100}
                                className={`w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors ${formErrors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                placeholder="Enter article title..."
                            />
                            <div className="flex justify-between mt-1">
                                {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
                                <p className={`text-sm ml-auto ${formData.title.length > 90 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {formData.title.length}/100
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value });
                                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                                }}
                                rows={6}
                                className={`w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 resize-none transition-colors ${formErrors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                placeholder="Enter article description..."
                            />
                            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                        </div>

                        {/* Language & Trending Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                    Language <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                                >
                                    {languageOptions.map(lang => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Trending Toggle */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                    Trending Status
                                </label>
                                <div
                                    onClick={() => setFormData({ ...formData, is_trending: !formData.is_trending })}
                                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.is_trending
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingUp
                                            size={20}
                                            className={formData.is_trending ? 'text-orange-500' : 'text-gray-400'}
                                        />
                                        <span className={`font-medium ${formData.is_trending
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {formData.is_trending ? '🔥 Trending' : 'Normal'}
                                        </span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_trending ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_trending ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        {categories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                    Categories <span className="text-red-500">*</span>
                                    <span className="text-gray-500 text-xs ml-2">(Click to select)</span>
                                </label>
                                <div className={`flex flex-wrap gap-3 p-4 border-2 rounded-lg ${formErrors.categories
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/30'
                                    }`}>
                                    {categories.map(cat => {
                                        const isSelected = formData.categories.includes(cat.id);
                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => handleCategoryChange(cat.id)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white border-2 border-blue-700'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                                                    }`}
                                            >
                                                {isSelected && <Check size={16} />}
                                                {cat.name}
                                            </div>
                                        );
                                    })}
                                </div>
                                {formErrors.categories && (
                                    <p className="text-red-500 text-sm mt-2">{formErrors.categories}</p>
                                )}
                            </div>
                        )}

                        {/* Featured Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Featured Image <span className="text-red-500">*</span>
                                <span className="text-gray-500 text-xs ml-2">(Max {IMAGE_CONFIG.maxSizeLabel} • All image formats)</span>
                            </label>

                            {/* Supported formats */}
                            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    📷 Supported: JPG, PNG, GIF, WebP, AVIF, HEIC, BMP, SVG, TIFF
                                </p>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative mb-3 inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-48 h-32 object-cover rounded-lg border-2 border-green-500"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {imageUploading && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Loader2 size={16} className="animate-spin text-blue-600" />
                                        <span className="text-sm text-blue-600">Uploading... {uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                disabled={imageUploading}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formErrors.image
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500'
                                    }`}
                            >
                                <Upload size={20} className="text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">
                                    Click to upload (Max {IMAGE_CONFIG.maxSizeLabel})
                                </span>
                            </label>
                            {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}

                            {/* OR Divider */}
                            <div className="flex items-center my-3">
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="px-3 text-sm text-gray-500">OR</span>
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            </div>

                            {/* URL Input */}
                            <input
                                type="url"
                                value={formData.image.startsWith('blob:') ? '' : formData.image}
                                onChange={handleImageUrlChange}
                                placeholder="Paste image URL..."
                                className="w-full px-4 py-3 border-2 rounded-lg dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                                <Tag size={16} className="inline mr-1" />
                                Tags <span className="text-red-500">*</span>
                                <span className="text-gray-500 text-xs ml-2">(Press Enter to add)</span>
                            </label>
                            <div className={`border-2 rounded-lg p-3 ${formErrors.tags ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                                }`}>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded-full text-sm"
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Type tag and press Enter..."
                                    className="w-full border-0 focus:outline-none bg-transparent dark:text-white"
                                />
                            </div>
                            {formErrors.tags && <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/news')}
                                className="px-6 py-3 border-2 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'Draft')}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                disabled={saving || imageUploading}
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save as Draft
                            </button>

                            <button
                                type="submit"
                                disabled={saving || imageUploading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {id ? 'Update Article' : 'Submit for Approval'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewsEditor;