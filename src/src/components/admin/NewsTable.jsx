import React, { useState } from 'react';
import {
    Eye,
    Edit2,
    Trash2,
    ThumbsUp,
    MessageSquare,
    Share2,
    Clock,
    TrendingUp,
    Calendar,
    Filter,
    MoreVertical,
    Copy,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewsTable = ({ news, onEdit, onDelete, onView, loading = false }) => {
    const navigate = useNavigate();
    const [selectedNews, setSelectedNews] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [showActionMenu, setShowActionMenu] = useState(null);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedNews = React.useMemo(() => {
        let sortableNews = [...news];
        if (sortConfig.key) {
            sortableNews.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableNews;
    }, [news, sortConfig]);

    const toggleSelectNews = (id) => {
        if (selectedNews.includes(id)) {
            setSelectedNews(selectedNews.filter(newsId => newsId !== id));
        } else {
            setSelectedNews([...selectedNews, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedNews.length === news.length) {
            setSelectedNews([]);
        } else {
            setSelectedNews(news.map(n => n.id));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
            scheduled: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || colors.draft;
    };

    const copyArticleLink = (article) => {
        const url = `${window.location.origin}/article/${article.slug || article.id}`;
        navigator.clipboard.writeText(url);
        alert('Article link copied!');
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-24 h-16 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles Found</h3>
                <p className="text-gray-500 mb-4">Create your first article to get started</p>
                <button
                    onClick={() => navigate('/admin/news/create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Create Article
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Bulk Actions */}
            {selectedNews.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                        {selectedNews.length} article(s) selected
                    </span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Publish Selected
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            Delete Selected
                        </button>
                        <button
                            onClick={() => setSelectedNews([])}
                            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedNews.length === news.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('title')}
                            >
                                Article {getSortIcon('title')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('category')}
                            >
                                Category {getSortIcon('category')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('reporter')}
                            >
                                Author {getSortIcon('reporter')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('status')}
                            >
                                Status {getSortIcon('status')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Stats
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('createdAt')}
                            >
                                Date {getSortIcon('createdAt')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedNews.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedNews.includes(article.id)}
                                        onChange={() => toggleSelectNews(article.id)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {article.thumbnail && (
                                            <img
                                                src={article.thumbnail}
                                                alt={article.title}
                                                className="w-20 h-14 rounded object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                                                {article.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${article.language === 'telugu'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {article.language}
                                                </span>
                                                {article.isFeatured && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                        Featured
                                                    </span>
                                                )}
                                                {article.isBreaking && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium animate-pulse">
                                                        Breaking
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">{article.category}</span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {article.reporter?.charAt(0) || 'A'}
                                        </div>
                                        <span className="text-sm text-gray-900">{article.reporter}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                                        {article.status}
                                    </span>
                                    {article.scheduledAt && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock size={12} />
                                            {new Date(article.scheduledAt).toLocaleString()}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Eye size={14} className="text-blue-500" />
                                            <span className="font-medium">{article.views || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <ThumbsUp size={14} className="text-green-500" />
                                            <span className="font-medium">{article.likes || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <MessageSquare size={14} className="text-purple-500" />
                                            <span className="font-medium">{article.comments || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Share2 size={14} className="text-orange-500" />
                                            <span className="font-medium">{article.shares || 0}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(article.createdAt).toLocaleTimeString()}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onView(article)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(article)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => copyArticleLink(article)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Copy Link"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(article.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <div className="relative">
                                            <button
                                                onClick={() => setShowActionMenu(showActionMenu === article.id ? null : article.id)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {showActionMenu === article.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                                    <button
                                                        onClick={() => {
                                                            window.open(`/article/${article.slug || article.id}`, '_blank');
                                                            setShowActionMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                                    >
                                                        <ExternalLink size={14} />
                                                        View on Site
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // Duplicate article logic
                                                            setShowActionMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                                    >
                                                        <Copy size={14} />
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            copyArticleLink(article);
                                                            setShowActionMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                                    >
                                                        <Share2 size={14} />
                                                        Share Link
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NewsTable;