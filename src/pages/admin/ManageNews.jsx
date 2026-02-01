// src/pages/admin/ManageNews.jsx - FULLY FIXED VERSION WITH CONTENT CLEANER

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Search, Eye, RefreshCw, Save, X, Check,
    AlertCircle, FileText, ImageOff, Upload, Loader2, Tag,
    XCircle, TrendingUp, Clock, CheckCircle, Video, Play, Film, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/index';
import categoryApi from '../../api/categoryApi';
import uploadApi from '../../api/uploadApi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ═══════════════════════════════════════════════════════════════
// 🎨 CUSTOM QUILL STYLES - ALIGNMENT BUTTONS & CLEAN DISPLAY
// ═══════════════════════════════════════════════════════════════
const quillCustomStyles = `
  .custom-quill-editor .ql-toolbar {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    border: none !important;
    border-radius: 12px 12px 0 0;
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .custom-quill-editor .ql-toolbar .ql-formats {
    margin-right: 8px !important;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .custom-quill-editor .ql-toolbar button {
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 6px !important;
    transition: all 0.2s ease !important;
  }
  
  .custom-quill-editor .ql-toolbar button:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
  
  .custom-quill-editor .ql-toolbar button.ql-active {
    background: rgba(255, 255, 255, 0.3) !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-stroke { 
    stroke: #ffffff !important; 
  }
  
  .custom-quill-editor .ql-toolbar .ql-fill { 
    fill: #ffffff !important; 
  }
  
  .custom-quill-editor .ql-toolbar .ql-picker { 
    color: #ffffff !important; 
  }
  
  .custom-quill-editor .ql-toolbar .ql-picker-label {
    color: #ffffff !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    border-radius: 6px;
    padding: 4px 8px !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-picker-options {
    background-color: #ffffff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
    padding: 8px !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-picker-item {
    color: #1f2937 !important;
    font-weight: 500 !important;
    padding: 8px 10px !important;
    border-radius: 4px !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-picker-item:hover {
    color: #4f46e5 !important;
    background-color: #f3f4f6 !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-align {
    width: 32px !important;
    height: 32px !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-align svg {
    width: 18px !important;
    height: 18px !important;
  }
  
  .custom-quill-editor .ql-toolbar .ql-align .ql-stroke {
    stroke: #ffffff !important;
  }
  
  .custom-quill-editor .ql-container {
    border: 2px solid #e5e7eb !important;
    border-top: none !important;
    border-radius: 0 0 12px 12px;
    min-height: 300px;
    background: #ffffff;
  }
  
  .custom-quill-editor .ql-editor {
    min-height: 300px;
    padding: 20px;
    font-size: 16px;
    line-height: 1.8;
    color: #000000 !important;
  }
  
  .custom-quill-editor .ql-editor p {
    margin-bottom: 0.5em !important;
    margin-top: 0 !important;
  }
  
  .custom-quill-editor .ql-editor p:empty {
    display: none !important;
  }
  
  .custom-quill-editor .ql-editor p br:only-child {
    display: none !important;
  }
  
  .custom-quill-editor.focused .ql-container {
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
  
  .custom-quill-editor .ql-editor.ql-blank::before {
    color: #9ca3af;
    font-style: normal;
  }
  
  /* View modal content spacing fix */
  .news-content-display p {
    margin-bottom: 0.75em !important;
    margin-top: 0 !important;
    line-height: 1.7 !important;
  }
  
  .news-content-display p:empty {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
  }
  
  .news-content-display br + br {
    display: none !important;
  }
`;

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: SAFELY EXTRACT MEDIA URL
// ═══════════════════════════════════════════════════════════════
const extractMediaUrl = (media) => {
    if (!media) return '';
    if (typeof media === 'string') return media;
    if (typeof media === 'object') {
        if (media.url) return media.url;
        if (media.secure_url) return media.secure_url;
        if (media.src) return media.src;
    }
    if (Array.isArray(media) && media.length > 0) {
        return extractMediaUrl(media[0]);
    }
    return '';
};

// ═══════════════════════════════════════════════════════════════
// 🧹 CONTENT CLEANER - Removes extra empty paragraphs & spaces
// ═══════════════════════════════════════════════════════════════
const cleanContent = (html) => {
    if (!html) return '';
    
    return html
        // Remove empty paragraphs with just <br> or spaces
        .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
        // Remove multiple consecutive empty paragraphs
        .replace(/(<p>\s*<\/p>\s*){2,}/gi, '<p></p>')
        // Remove empty paragraphs at start
        .replace(/^(\s*<p>\s*<br\s*\/?>\s*<\/p>\s*)+/gi, '')
        // Remove empty paragraphs at end
        .replace(/(\s*<p>\s*<br\s*\/?>\s*<\/p>\s*)+$/gi, '')
        // Remove standalone <br> between paragraphs
        .replace(/<\/p>\s*<br\s*\/?>\s*<p>/gi, '</p><p>')
        // Clean up multiple line breaks
        .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
        // Remove Zero Width No-Break Space
        .replace(/\uFEFF/g, '')
        // Remove empty paragraphs with only whitespace
        .replace(/<p>\s+<\/p>/gi, '')
        // Trim whitespace
        .trim();
};

// ═══════════════════════════════════════════════════════════════
// 🚨 ERROR LOGGER
// ═══════════════════════════════════════════════════════════════
const logError = (location, message, details = null) => {
    console.group('%c🚨 ERROR', 'background: #ff0000; color: white; padding: 2px 8px; border-radius: 4px;');
    console.log('%c📍 Location:', 'color: #ff6b6b;', location);
    console.log('%c❌ Message:', 'color: #ff6b6b;', message);
    if (details) console.log('%c🔍 Details:', 'color: #ff6b6b;', details);
    console.groupEnd();
};

const ManageNews = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isAdmin } = useAuth();
    const quillRef = useRef(null);

    // States
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewingNews, setViewingNews] = useState(null);
    const [tagInput, setTagInput] = useState('');

    // Upload States
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoPreview, setVideoPreview] = useState('');
    const [inlineImageUploading, setInlineImageUploading] = useState(false);

    const [formErrors, setFormErrors] = useState({});
    const [editorFocused, setEditorFocused] = useState(false);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const canEdit = isAdmin || user?.role === 'reporter';

    // Filter States
    const [filters, setFilters] = useState({ search: '', language: 'ALL', status: 'ALL' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        language: 'HINDI',
        categories: [],
        tags: [],
        image: '',
        video: '',
        is_trending: false,
        status: 'Pending'
    });

    const languageOptions = [
        { value: 'HINDI', label: 'हिंदी (Hindi)' },
        { value: 'ENGLISH', label: 'English' },
    ];

    const statusOptions = [
        { value: 'Pending', label: 'Pending', color: 'yellow', icon: Clock },
        { value: 'Approved', label: 'Approved', color: 'green', icon: CheckCircle },
        { value: 'Rejected', label: 'Rejected', color: 'red', icon: XCircle }
    ];

    // ═══════════════════════════════════════════════════════════════
    // 🖼️ CUSTOM IMAGE HANDLER FOR QUILL
    // ═══════════════════════════════════════════════════════════════
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showFormMessage('error', 'Image too large! Max 5MB for inline images.');
                return;
            }

            setInlineImageUploading(true);
            showFormMessage('info', '📤 Uploading image...');

            try {
                const result = await uploadApi.upload(file, (progress) => { });

                if (result.success && result.url) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', result.url);
                    quill.setSelection(range.index + 1);
                    showFormMessage('success', '✅ Image inserted successfully!');
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                logError('imageHandler', 'Inline image upload failed', error.message);
                showFormMessage('error', 'Image upload failed: ' + error.message);
            } finally {
                setInlineImageUploading(false);
            }
        };
    };

    // ═══════════════════════════════════════════════════════════════
    // 📝 QUILL MODULES - ALIGNMENT BUTTONS DIRECTLY IN TOOLBAR
    // ═══════════════════════════════════════════════════════════════
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const quillFormats = [
        'font', 'size', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'align', 'list', 'bullet',
        'indent', 'blockquote', 'code-block',
        'link', 'image'
    ];

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const extractCategoryId = (cat) => {
        if (!cat) return null;
        if (typeof cat === 'string' || typeof cat === 'number') return cat;
        return cat.id || cat._id || null;
    };

    const filteredNews = useMemo(() => {
        return news.filter((item) => {
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (!item.title?.toLowerCase().includes(search)) return false;
            }
            if (filters.language !== 'ALL' && item.language?.toUpperCase() !== filters.language) return false;
            if (filters.status !== 'ALL' && item.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
            return true;
        });
    }, [news, filters]);

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const getStatusConfig = (status) => {
        return statusOptions.find(s => s.value.toLowerCase() === (status || 'pending').toLowerCase()) || statusOptions[0];
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNews();
            fetchCategories();
        }
    }, [isAuthenticated]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const showFormMessage = (type, text) => {
        setFormMessage({ type, text });
        if (type !== 'info') {
            setTimeout(() => setFormMessage({ type: '', text: '' }), 8000);
        }
    };

    const getLanguageLabel = (code) => {
        const lang = languageOptions.find(l => l.value === code?.toUpperCase());
        return lang ? lang.label.split(' ')[0] : code;
    };

    // ═══════════════════════════════════════════════════════════════
    // ✅ VALIDATE FORM
    // ═══════════════════════════════════════════════════════════════
    const validateForm = () => {
        const errors = {};
        
        if (!formData.title || !formData.title.trim()) {
            errors.title = 'Title is required';
        }
        
        const plainText = (formData.description || '').replace(/<[^>]+>/g, '').trim();
        if (!plainText) {
            errors.description = 'Description is required';
        }
        
        if (!formData.tags || formData.tags.length === 0) {
            errors.tags = 'At least one tag is required';
        }
        
        if (!formData.categories || formData.categories.length === 0) {
            errors.categories = 'At least one category is required';
        }
        
        const imageUrl = extractMediaUrl(formData.image);
        const videoUrl = extractMediaUrl(formData.video);
        
        if (!imageUrl && !videoUrl) {
            errors.media = 'Please provide either an image or a video';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ═══════════════════════════════════════════════════════════════
    // 📡 API FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const fetchCategories = async (language = formData.language) => {
        try {
            console.log('🔍 Fetching categories for language:', language);
            const result = await categoryApi.getNewsCategories(language);
            console.log('📂 Categories received:', result.data || []);
            if (result.success) {
                setCategories(result.data || []);
            }
        } catch (error) {
            logError('fetchCategories', error.message);
        }
    };

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await api.get('/backoffice/news');
            if (response.data?.success) {
                setNews(response.data.data || []);
            }
        } catch (error) {
            logError('fetchNews', error.message);
        } finally {
            setLoading(false);
        }
    };

    const createNews = async (payload) => {
        return (await api.post('/backoffice/news', payload)).data;
    };
    
    const updateNews = async (id, payload) => {
        try {
            return (await api.put(`/backoffice/news/${id}`, payload)).data;
        } catch (error) {
            if (error.response?.status === 405) {
                return (await api.post(`/backoffice/news/${id}`, { ...payload, _method: 'PUT' })).data;
            }
            throw error;
        }
    };
    
    const deleteNews = async (id) => {
        return (await api.delete(`/backoffice/news/${id}`)).data;
    };

    // ═══════════════════════════════════════════════════════════════
    // 📤 IMAGE UPLOAD HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            return showFormMessage('error', 'Max 2MB!');
        }

        setImagePreview(URL.createObjectURL(file));
        setImageUploading(true);

        try {
            const result = await uploadApi.upload(file, setUploadProgress);
            if (result.success) {
                setFormData(p => ({ ...p, image: result.url }));
                setImagePreview(result.url);
                showFormMessage('success', 'Image uploaded!');
            }
        } catch (error) {
            showFormMessage('error', error.message);
            setImagePreview('');
        } finally {
            setImageUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(p => ({ ...p, image: '' }));
        setImagePreview('');
    };

    // ═══════════════════════════════════════════════════════════════
    // 🎬 VIDEO UPLOAD HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleVideoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 50 * 1024 * 1024) {
            return showFormMessage('error', 'Max 50MB!');
        }

        setVideoPreview(URL.createObjectURL(file));
        setVideoUploading(true);

        try {
            const result = await uploadApi.upload(file, setVideoUploadProgress);
            if (result.success) {
                setFormData(p => ({ ...p, video: result.url }));
                setVideoPreview(result.url);
                showFormMessage('success', 'Video uploaded!');
            }
        } catch (error) {
            showFormMessage('error', error.message);
            setVideoPreview('');
        } finally {
            setVideoUploading(false);
        }
    };

    const handleRemoveVideo = () => {
        setFormData(p => ({ ...p, video: '' }));
        setVideoPreview('');
    };

    // ═══════════════════════════════════════════════════════════════
    // 💾 SUBMIT HANDLER - WITH CONTENT CLEANING
    // ═══════════════════════════════════════════════════════════════
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return showFormMessage('error', Object.values(formErrors)[0]);
        }

        setSaving(true);
        try {
            // Clean the description before saving
            const cleanedDescription = cleanContent(formData.description);
            
            const payload = { 
                ...formData, 
                description: cleanedDescription,
                image: extractMediaUrl(formData.image),
                video: extractMediaUrl(formData.video),
                status: editingId ? formData.status : 'Pending' 
            };
            
            const result = editingId 
                ? await updateNews(editingId, payload) 
                : await createNews(payload);

            if (result?.success) {
                showMessage('success', `News ${editingId ? 'updated' : 'created'}!`);
                setIsModalOpen(false);
                resetForm();
                fetchNews();
            } else {
                showFormMessage('error', result?.description || 'Failed');
            }
        } catch (error) {
            showFormMessage('error', error.response?.data?.description || error.message);
        } finally {
            setSaving(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🗑️ DELETE HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleDelete = async (id, title) => {
        if (window.confirm(`Delete "${title}"?`)) {
            try {
                const res = await deleteNews(id);
                if (res?.success) {
                    showMessage('success', 'Deleted!');
                    fetchNews();
                }
            } catch (error) {
                showMessage('error', error.message);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // ✏️ EDIT HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleEdit = (item) => {
        const imageUrl = extractMediaUrl(item.image || item.featured_image);
        const videoUrl = extractMediaUrl(item.video);
        
        setFormData({
            title: item.title || '',
            description: item.description || '',
            language: item.language || 'HINDI',
            categories: (item.categories || []).map(extractCategoryId).filter(Boolean),
            tags: Array.isArray(item.tags) ? item.tags : [],
            image: imageUrl,
            video: videoUrl,
            is_trending: item.is_trending || false,
            status: item.status || 'Pending'
        });
        setImagePreview(imageUrl);
        setVideoPreview(videoUrl);
        setEditingId(item.id || item._id);
        setFormErrors({});
        setIsModalOpen(true);
    };

    // ═══════════════════════════════════════════════════════════════
    // 🔄 RESET FORM
    // ═══════════════════════════════════════════════════════════════
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            language: 'HINDI',
            categories: [],
            tags: [],
            image: '',
            video: '',
            is_trending: false,
            status: 'Pending'
        });
        setTagInput('');
        setImagePreview('');
        setVideoPreview('');
        setEditingId(null);
        setFormErrors({});
    };

    // ═══════════════════════════════════════════════════════════════
    // 📂 CATEGORY HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleCategoryChange = (id) => {
        setFormData(p => ({
            ...p,
            categories: p.categories.includes(id)
                ? p.categories.filter(c => c !== id)
                : [...p.categories, id]
        }));
    };

    // ═══════════════════════════════════════════════════════════════
    // 🏷️ TAG HANDLER
    // ═══════════════════════════════════════════════════════════════
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase();
            if (tag && !formData.tags.includes(tag)) {
                setFormData(p => ({ ...p, tags: [...p.tags, tag] }));
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tagToRemove) }));
    };

    // ═══════════════════════════════════════════════════════════════
    // 📊 UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const getWordCount = () => {
        const text = (formData.description || '').replace(/<[^>]+>/g, '').trim();
        return text ? text.split(/\s+/).length : 0;
    };

    const getArticleImage = (item) => extractMediaUrl(item.image || item.featured_image);
    const getArticleVideo = (item) => extractMediaUrl(item.video);

    // ═══════════════════════════════════════════════════════════════
    // 🔐 AUTH CHECK
    // ═══════════════════════════════════════════════════════════════
    if (!isAuthenticated) {
        return (
            <div className="p-8 text-center bg-white text-black">
                Please Login
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎨 RENDER
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-white">
            <style>{quillCustomStyles}</style>

            <div className="container mx-auto p-4 md:p-6">
                
                {/* ═══════════════════════════════════════════════════════ */}
                {/* HEADER */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-black">📰 News Articles</h1>
                        <p className="text-gray-600">{news.length} articles</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={fetchNews} 
                            className="bg-gray-100 text-black p-2 rounded flex gap-2 hover:bg-gray-200"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> 
                            Refresh
                        </button>
                        {canEdit && (
                            <button 
                                onClick={() => { resetForm(); setIsModalOpen(true); }} 
                                className="bg-blue-600 text-white p-2 rounded flex gap-2 hover:bg-blue-700"
                            >
                                <Plus size={20} /> Create News
                            </button>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* GLOBAL MESSAGE */}
                {/* ═══════════════════════════════════════════════════════ */}
                {message.text && (
                    <div className={`p-4 mb-4 rounded flex items-center gap-2 ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message.type === 'success' ? <Check /> : <AlertCircle />} 
                        {message.text}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* FILTERS */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="bg-white border border-gray-200 p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 p-2 border border-gray-300 rounded bg-white text-black focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filters.language}
                        onChange={e => setFilters({ ...filters, language: e.target.value })}
                        className="p-2 border border-gray-300 rounded bg-white text-black focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Languages</option>
                        {languageOptions.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                        className="p-2 border border-gray-300 rounded bg-white text-black focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        {statusOptions.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* NEWS TABLE */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div className="bg-white border border-gray-200 rounded shadow overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-black font-semibold">Title</th>
                                <th className="p-4 text-left text-black font-semibold">Lang</th>
                                <th className="p-4 text-left text-black font-semibold">Status</th>
                                <th className="p-4 text-left text-black font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedNews.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        No articles found
                                    </td>
                                </tr>
                            ) : (
                                paginatedNews.map(item => {
                                    const config = getStatusConfig(item.status);
                                    const Icon = config.icon;
                                    const itemImage = getArticleImage(item);
                                    
                                    return (
                                        <tr key={item.id || item._id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {itemImage ? (
                                                        <img 
                                                            src={itemImage} 
                                                            className="w-10 h-10 rounded object-cover" 
                                                            alt="" 
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                            <FileText size={16} className="text-gray-500" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-black truncate max-w-xs">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-black">
                                                {getLanguageLabel(item.language)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded w-fit ${
                                                    config.color === 'green' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : config.color === 'red' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    <Icon size={14} /> {config.label}
                                                </span>
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <button 
                                                    onClick={() => { 
                                                        setViewingNews(item); 
                                                        setIsViewModalOpen(true); 
                                                    }} 
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {canEdit && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(item)} 
                                                            className="text-green-600 hover:bg-green-50 p-2 rounded"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id || item._id, item.title)} 
                                                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* PAGINATION */}
                {/* ═══════════════════════════════════════════════════════ */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => p - 1)} 
                            className="px-4 py-2 bg-gray-100 text-black rounded disabled:opacity-50 hover:bg-gray-200"
                        >
                            Prev
                        </button>
                        <span className="px-4 py-2 text-black">
                            {currentPage} / {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(p => p + 1)} 
                            className="px-4 py-2 bg-gray-100 text-black rounded disabled:opacity-50 hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* CREATE/EDIT MODAL */}
                {/* ═══════════════════════════════════════════════════════ */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
                        <div className="container mx-auto max-w-4xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-black">
                                    {editingId ? '✏️ Edit News' : '➕ Create News'}
                                </h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 mx-auto max-w-2xl">
                                
                                {/* TITLE */}
                                <div>
                                    <label className="block mb-2 font-medium text-black">
                                        Title *
                                    </label>
                                    <input
                                        className={`w-full border p-3 rounded-lg bg-white text-black ${
                                            formErrors.title ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:border-blue-500`}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter news title..."
                                    />
                                    {formErrors.title && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                    )}
                                </div>

                                {/* DESCRIPTION - QUILL EDITOR */}
                                <div>
                                    <label className="flex items-center gap-2 mb-2 font-medium text-black">
                                        <FileText size={16} className="text-purple-600" />
                                        Description *
                                        {inlineImageUploading && (
                                            <span className="text-blue-500 text-sm flex items-center gap-1">
                                                <Loader2 size={14} className="animate-spin" /> 
                                                Uploading image...
                                            </span>
                                        )}
                                    </label>

                                    <div className={`custom-quill-editor ${editorFocused ? 'focused' : ''} ${formErrors.description ? 'has-error' : ''}`}>
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(content) => setFormData({ ...formData, description: content })}
                                            onFocus={() => setEditorFocused(true)}
                                            onBlur={() => setEditorFocused(false)}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="✍️ Write your article here..."
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500">
                                            💡 Images in editor are uploaded to cloud automatically!
                                        </p>
                                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            📝 {getWordCount()} words
                                        </span>
                                    </div>
                                    {formErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                    )}
                                </div>

                                {/* LANGUAGE & TRENDING */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-medium text-black">
                                            Language *
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:outline-none focus:border-blue-500"
                                            value={formData.language}
                                            onChange={async (e) => {
                                                const newLanguage = e.target.value;
                                                console.log('🔄 Selected language:', newLanguage);
                                                setFormData({ ...formData, language: newLanguage, categories: [] });
                                                // Pass the new language directly to fetchCategories
                                                await fetchCategories(newLanguage);
                                            }}
                                        >
                                            {languageOptions.map(l => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium text-black">
                                            Trending
                                        </label>
                                        <div
                                            onClick={() => setFormData(p => ({ ...p, is_trending: !p.is_trending }))}
                                            className={`border p-3 rounded-lg flex items-center justify-between cursor-pointer ${
                                                formData.is_trending 
                                                    ? 'bg-orange-50 border-orange-500' 
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <span className={
                                                formData.is_trending 
                                                    ? 'text-orange-600 font-medium' 
                                                    : 'text-gray-500'
                                            }>
                                                {formData.is_trending ? '🔥 Trending' : 'Not Trending'}
                                            </span>
                                            <TrendingUp 
                                                size={20} 
                                                className={
                                                    formData.is_trending 
                                                        ? 'text-orange-500' 
                                                        : 'text-gray-400'
                                                } 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CATEGORIES */}
                                <div>
                                    <label className="block mb-2 font-medium text-black">
                                        Categories *
                                    </label>
                                    <div className={`flex flex-wrap gap-2 p-3 border rounded-lg bg-white ${
                                        formErrors.categories ? 'border-red-500' : 'border-gray-300'
                                    }`}>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id || cat._id}
                                                type="button"
                                                onClick={() => handleCategoryChange(cat.id || cat._id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                    formData.categories.includes(cat.id || cat._id)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {formData.categories.includes(cat.id || cat._id) && (
                                                    <Check size={14} className="inline mr-1" />
                                                )}
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                    {formErrors.categories && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.categories}</p>
                                    )}
                                </div>

                                {/* MEDIA INFO */}
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Info size={18} className="text-blue-600" />
                                    <p className="text-sm text-blue-700">
                                        Provide either a Featured Image or Video (at least one required)
                                    </p>
                                </div>

                                {/* FEATURED IMAGE */}
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white">
                                    <label className="block mb-2 font-medium text-black">
                                        📷 Featured Image
                                    </label>
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="h-32 rounded-lg border" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveImage} 
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 items-center">
                                            <input 
                                                ref={fileInputRef} 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleImageSelect} 
                                                id="imgUpload" 
                                            />
                                            <label 
                                                htmlFor="imgUpload" 
                                                className="bg-gray-100 text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 flex items-center gap-2"
                                            >
                                                <Upload size={16} /> Upload
                                            </label>
                                            <span className="text-gray-400">or</span>
                                            <input
                                                type="url"
                                                placeholder="Paste image URL"
                                                value={typeof formData.image === 'string' ? formData.image : ''}
                                                onChange={e => { 
                                                    setFormData(p => ({ ...p, image: e.target.value })); 
                                                    setImagePreview(e.target.value); 
                                                }}
                                                className="border border-gray-300 p-2 rounded-lg flex-1 bg-white text-black focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    )}
                                    {imageUploading && (
                                        <p className="text-blue-500 text-sm mt-2">
                                            Uploading... {uploadProgress}%
                                        </p>
                                    )}
                                </div>

                                {/* VIDEO */}
                                <div className="border border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
                                    <label className="block mb-2 font-medium text-purple-700">
                                        🎬 Video (Optional)
                                    </label>
                                    {videoPreview ? (
                                        <div className="relative">
                                            <video 
                                                src={videoPreview} 
                                                controls 
                                                className="h-32 rounded-lg border" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveVideo} 
                                                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 items-center">
                                            <input 
                                                ref={videoInputRef} 
                                                type="file" 
                                                accept="video/*" 
                                                className="hidden" 
                                                onChange={handleVideoSelect} 
                                                id="vidUpload" 
                                            />
                                            <label 
                                                htmlFor="vidUpload" 
                                                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-200 flex items-center gap-2"
                                            >
                                                <Upload size={16} /> Upload Video
                                            </label>
                                            <span className="text-purple-400">or</span>
                                            <input
                                                type="url"
                                                placeholder="Paste video URL"
                                                value={typeof formData.video === 'string' ? formData.video : ''}
                                                onChange={e => { 
                                                    setFormData(p => ({ ...p, video: e.target.value })); 
                                                    setVideoPreview(e.target.value); 
                                                }}
                                                className="border border-purple-300 p-2 rounded-lg flex-1 bg-white text-black focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    )}
                                    {videoUploading && (
                                        <p className="text-purple-500 text-sm mt-2">
                                            Uploading... {videoUploadProgress}%
                                        </p>
                                    )}
                                </div>

                                {/* MEDIA ERROR */}
                                {formErrors.media && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} /> {formErrors.media}
                                    </div>
                                )}

                                {/* TAGS */}
                                <div>
                                    <label className="block mb-2 font-medium text-black">
                                        <Tag size={16} className="inline mr-1" /> Tags *
                                    </label>
                                    <div className={`border p-3 rounded-lg bg-white ${
                                        formErrors.tags ? 'border-red-500' : 'border-gray-300'
                                    }`}>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map(tag => (
                                                <span 
                                                    key={tag} 
                                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                                >
                                                    #{tag}
                                                    <X 
                                                        size={14} 
                                                        className="cursor-pointer hover:text-red-500" 
                                                        onClick={() => handleRemoveTag(tag)} 
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder="Type tag and press Enter..."
                                            className="w-full outline-none bg-transparent text-black"
                                        />
                                    </div>
                                    {formErrors.tags && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>
                                    )}
                                </div>

                                {/* FORM MESSAGE */}
                                {formMessage.text && (
                                    <div className={`p-4 rounded-lg flex items-center gap-2 ${
                                        formMessage.type === 'success' 
                                            ? 'bg-green-100 text-green-700' 
                                            : formMessage.type === 'info' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-red-100 text-red-700'
                                    }`}>
                                        {formMessage.type === 'success' ? (
                                            <Check size={20} />
                                        ) : formMessage.type === 'info' ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <AlertCircle size={20} />
                                        )}
                                        {formMessage.text}
                                    </div>
                                )}

                                {/* FORM BUTTONS */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-black"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving || inlineImageUploading} 
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
                                    >
                                        {saving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        {editingId ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* VIEW MODAL */}
                {/* ═══════════════════════════════════════════════════════ */}
                {isViewModalOpen && viewingNews && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between">
                                <h2 className="text-xl font-bold text-black">👁️ View Article</h2>
                                <button 
                                    onClick={() => setIsViewModalOpen(false)} 
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="p-6">
                                {getArticleImage(viewingNews) && (
                                    <img 
                                        src={getArticleImage(viewingNews)} 
                                        className="w-full h-64 object-cover rounded-lg mb-4" 
                                        alt="" 
                                    />
                                )}
                                {getArticleVideo(viewingNews) && (
                                    <video 
                                        src={getArticleVideo(viewingNews)} 
                                        controls 
                                        className="w-full rounded-lg mb-4 bg-black" 
                                    />
                                )}

                                <h1 className="text-2xl font-bold mb-3 text-black">
                                    {viewingNews.title}
                                </h1>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {getLanguageLabel(viewingNews.language)}
                                    </span>
                                    {viewingNews.is_trending && (
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                                            🔥 Trending
                                        </span>
                                    )}
                                    {viewingNews.tags?.map(tag => (
                                        <span 
                                            key={tag} 
                                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CLEAN CONTENT DISPLAY */}
                                <div
                                    className="news-content-display prose prose-lg max-w-none text-black"
                                    dangerouslySetInnerHTML={{ 
                                        __html: cleanContent(viewingNews.description) 
                                    }}
                                />
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                                {canEdit && (
                                    <button 
                                        onClick={() => { 
                                            setIsViewModalOpen(false); 
                                            handleEdit(viewingNews); 
                                        }} 
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsViewModalOpen(false)} 
                                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManageNews;