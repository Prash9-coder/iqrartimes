// src/components/admin/ApprovalQueue.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check,
    X,
    Eye,
    Edit2,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Newspaper,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import api from '../../api/index';

const ApprovalQueue = () => {
    const navigate = useNavigate();
    const [allNews, setAllNews] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('Pending');
    const [expandedArticles, setExpandedArticles] = useState(new Set());

    const statusOptions = ['Pending', 'Approved', 'Rejected'];

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/backoffice/news?status=${filter}`);
            if (response.data?.success) {
                setAllNews(response.data.data || []);
            } else {
                setAllNews([]);
                showMessage('error', response.data?.description || 'Failed to fetch articles');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.description || 'Failed to fetch articles');
            setAllNews([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleApprove = async (article) => {
        if (!window.confirm(`Approve "${article.title}" for publishing?`)) return;

        setActionLoading(article.id);
        try {
            const response = await api.put(`/backoffice/news/${article.id}`, {
                status: 'Approved'
            });

            if (response.data?.success) {
                showMessage('success', '✅ Article approved successfully!');
                setAllNews(prev => prev.filter(item => item.id !== article.id));
            } else {
                showMessage('error', response.data?.description || 'Failed to approve article');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.description || 'Failed to approve article');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (article) => {
        if (!rejectionReason.trim()) {
            showMessage('error', 'Please provide a rejection reason');
            return;
        }

        setActionLoading(article.id);
        try {
            const response = await api.put(`/backoffice/news/${article.id}`, {
                status: 'Rejected',
                rejection_reason: rejectionReason
            });

            if (response.data?.success) {
                showMessage('success', '✅ Article rejected');
                setAllNews(prev => prev.filter(item => item.id !== article.id));
                setRejectionReason('');
                setShowRejectForm(null);
            } else {
                showMessage('error', response.data?.description || 'Failed to reject article');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.description || 'Failed to reject article');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (articleId) => {
        setExpandedArticles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(articleId)) {
                newSet.delete(articleId);
            } else {
                newSet.add(articleId);
            }
            return newSet;
        });
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || 'pending';
        const badges = {
            pending: {
                icon: Clock,
                text: 'Pending',
                className: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            },
            approved: {
                icon: CheckCircle,
                text: 'Approved',
                className: 'bg-green-100 text-green-800 border border-green-200'
            },
            rejected: {
                icon: XCircle,
                text: 'Rejected',
                className: 'bg-red-100 text-red-800 border border-red-200'
            }
        };

        const badge = badges[statusLower] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${badge.className}`}>
                <Icon size={14} />
                {badge.text}
            </span>
        );
    };

    const getImageUrl = (article) => {
        if (!article) return '/public/IqrarNews.jpeg';
        if (article.image) {
            if (Array.isArray(article.image) && article.image.length > 0) return article.image[0];
            if (typeof article.image === 'string') return article.image;
        }
        if (article.featured_image) {
            if (Array.isArray(article.featured_image) && article.featured_image.length > 0) return article.featured_image[0];
            if (typeof article.featured_image === 'string') return article.featured_image;
        }
        return '/public/IqrarNews.jpeg';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    // Strip HTML tags from content
    const stripHtmlTags = (html) => {
        if (!html || typeof html !== 'string') return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };

    const getCategoryName = (article) => {
        if (!article) return 'Uncategorized';
        if (article.category_name) return article.category_name;
        if (article.categories && Array.isArray(article.categories) && article.categories.length > 0) {
            const firstCategory = article.categories[0];
            if (!firstCategory) return 'Uncategorized';
            if (typeof firstCategory === 'object') {
                return firstCategory.name || firstCategory.title || 'Uncategorized';
            }
            if (typeof firstCategory === 'string') {
                if (firstCategory.includes('-') && firstCategory.length > 30) return 'Category';
                return firstCategory;
            }
        }
        if (article.category) {
            if (typeof article.category === 'object') {
                return article.category.name || article.category.title || 'Uncategorized';
            }
            return article.category;
        }
        return 'Uncategorized';
    };

    return (
        <div className="p-3 sm:p-6 pb-20 sm:pb-6">
            {/* 📱 Mobile Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <Newspaper className="text-primary" size={24} />
                            Approval Queue
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {allNews.length} {filter.toLowerCase()} article{allNews.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={fetchNews}
                        disabled={loading}
                        className="p-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 disabled:opacity-50 touch-manipulation active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`p-3 sm:p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="flex-1">{message.text}</span>
                    </div>
                )}
            </div>

            {/* 📱 Mobile Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                {statusOptions.map(status => {
                    const icons = {
                        'Pending': '⏳',
                        'Approved': '✅',
                        'Rejected': '❌'
                    };

                    return (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 font-medium transition-all
                                rounded-lg whitespace-nowrap touch-manipulation active:scale-95
                                ${filter === status
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                            `}
                        >
                            <span>{icons[status]}</span>
                            {status}
                        </button>
                    );
                })}
            </div>

            {/* Articles List */}
            {loading ? (
                <div className="bg-white rounded-xl shadow p-8 sm:p-12 text-center">
                    <RefreshCw size={40} className="mx-auto text-primary animate-spin mb-4" />
                    <p className="text-gray-500">Loading {filter.toLowerCase()} articles...</p>
                </div>
            ) : allNews.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 sm:p-12 text-center">
                    <Newspaper size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No {filter} Articles</h3>
                    <p className="text-sm text-gray-500">
                        {filter === 'Pending'
                            ? 'All caught up! No articles waiting for review.'
                            : `No ${filter.toLowerCase()} articles found.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {allNews.map((article) => {
                        const isExpanded = expandedArticles.has(article.id);

                        return (
                            <div key={article.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* 📱 Mobile Card Layout */}
                                <div className="p-4 sm:p-6">
                                    {/* Image & Title */}
                                    <div className="flex gap-3 sm:gap-4 mb-3">
                                        <img
                                            src={getImageUrl(article)}
                                            alt={article.title || 'Article'}
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                                            onError={(e) => {
                                                e.target.src = '/public/IqrarNews.jpeg';
                                            }}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-sm sm:text-base line-clamp-2 flex-1">
                                                    {article.title || 'Untitled Article'}
                                                </h3>
                                                {getStatusBadge(article.status)}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                <span>📁 {getCategoryName(article)}</span>
                                                <span>📅 {formatDate(article.created_at).split(',')[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description - Collapsible on Mobile */}
                                    {isExpanded && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                            {stripHtmlTags(article.description) || stripHtmlTags(article.summary) || 'No description'}
                                        </p>
                                    )}

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => toggleExpand(article.id)}
                                        className="sm:hidden flex items-center gap-1 text-xs text-primary mb-3"
                                    >
                                        {isExpanded ? (
                                            <>Show Less <ChevronUp size={14} /></>
                                        ) : (
                                            <>Show More <ChevronDown size={14} /></>
                                        )}
                                    </button>

                                    {/* Rejection Reason */}
                                    {article.status?.toLowerCase() === 'rejected' && article.rejection_reason && (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                            <p className="text-xs text-red-700">{article.rejection_reason}</p>
                                        </div>
                                    )}

                                    {/* 📱 Mobile Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedArticle(article);
                                                setShowPreview(true);
                                            }}
                                            className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium touch-manipulation active:scale-95"
                                        >
                                            <Eye size={16} /> Preview
                                        </button>

                                        {article.status?.toLowerCase() === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(article)}
                                                    disabled={actionLoading === article.id}
                                                    className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium touch-manipulation active:scale-95 disabled:opacity-50"
                                                >
                                                    {actionLoading === article.id ? (
                                                        <RefreshCw size={16} className="animate-spin" />
                                                    ) : (
                                                        <Check size={16} />
                                                    )}
                                                    <span className="hidden sm:inline">Approve</span>
                                                </button>

                                                <button
                                                    onClick={() => setShowRejectForm(article.id)}
                                                    className="flex-1 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-medium touch-manipulation active:scale-95"
                                                >
                                                    <X size={16} />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </button>
                                            </>
                                        )}

                                        {(article.status?.toLowerCase() === 'approved' || article.status?.toLowerCase() === 'rejected') && (
                                            <button
                                                onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                                className="flex-1 px-3 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm font-medium touch-manipulation active:scale-95"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {/* Rejection Form */}
                                    {showRejectForm === article.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-red-200">
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Rejection Reason <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                                rows="3"
                                                placeholder="Explain why this article is being rejected..."
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleReject(article)}
                                                    disabled={actionLoading === article.id || !rejectionReason.trim()}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium touch-manipulation active:scale-95"
                                                >
                                                    {actionLoading === article.id ? (
                                                        <RefreshCw size={16} className="animate-spin" />
                                                    ) : (
                                                        <X size={16} />
                                                    )}
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowRejectForm(null);
                                                        setRejectionReason('');
                                                    }}
                                                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium touch-manipulation active:scale-95"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 📱 Full-Screen Preview Modal */}
            {showPreview && selectedArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white w-full h-full sm:rounded-2xl sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
                        {/* Sticky Header */}
                        <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg sm:text-xl font-bold">Article Preview</h2>
                                    <div className="mt-2">{getStatusBadge(selectedArticle.status)}</div>
                                </div>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 touch-manipulation active:scale-95"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            <img
                                src={getImageUrl(selectedArticle)}
                                alt={selectedArticle.title || 'Article'}
                                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 sm:mb-6"
                                onError={(e) => {
                                    e.target.src = '/public/IqrarNews.jpeg';
                                }}
                            />

                            <h1 className="text-xl sm:text-2xl font-bold mb-4">
                                {selectedArticle.title || 'Untitled Article'}
                            </h1>

                            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-600 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                                <span>📁 {getCategoryName(selectedArticle)}</span>
                                <span>🌐 {selectedArticle.language || 'N/A'}</span>
                                <span>📅 {formatDate(selectedArticle.created_at)}</span>
                                {selectedArticle.author_name && (
                                    <span>✍️ {selectedArticle.author_name}</span>
                                )}
                            </div>

                            <div className="prose prose-sm sm:prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
                                    {stripHtmlTags(selectedArticle.description) || stripHtmlTags(selectedArticle.content) || 'No content available'}
                                </p>
                            </div>
                        </div>

                        {/* Sticky Footer - Mobile Action Buttons */}
                        <div className="sticky bottom-0 p-4 sm:p-6 border-t bg-white shadow-lg">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="flex-1 sm:flex-none px-6 py-3 border-2 rounded-lg hover:bg-gray-100 font-medium touch-manipulation active:scale-95"
                                >
                                    Close
                                </button>

                                {selectedArticle.status?.toLowerCase() === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowPreview(false);
                                                handleApprove(selectedArticle);
                                            }}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium touch-manipulation active:scale-95"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPreview(false);
                                                setShowRejectForm(selectedArticle.id);
                                            }}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium touch-manipulation active:scale-95"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalQueue;