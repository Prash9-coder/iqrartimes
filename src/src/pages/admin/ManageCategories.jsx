import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Lock, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const ManageCategories = () => {
    const { isAdmin } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [languageFilter, setLanguageFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        language: 'HINDI',
        is_active: true,
        parent_id: null,
        priority: 0  // ✅ Added priority field
    });

    const languageOptions = [
        { value: 'HINDI', label: 'हिंदी (Hindi)' },
        { value: 'ENGLISH', label: 'English' },
    ];

    // ✅ Priority options for quick selection
    const priorityOptions = [
        { value: 10, label: '⭐ Very High (10) - First in Header' },
        { value: 8, label: '🔥 High (8) - Header Priority' },
        { value: 5, label: '📌 Medium (5) - Header' },
        { value: 3, label: '📋 Low (3) - Header (if space)' },
        { value: 1, label: '📄 Minimum (1) - Last in Header' },
        { value: 0, label: '📁 None (0) - More Dropdown Only' },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (params = {}) => {
        setLoading(true);
        try {
            const { parent_only = null, language = null } = params;
            const queryParams = new URLSearchParams();
            
            if (parent_only !== null) {
                queryParams.append('parent_only', parent_only);
            }
            if (language) {
                queryParams.append('language', language);
            }
            
            const url = queryParams.toString() ? `/backoffice/category/?${queryParams.toString()}` : '/backoffice/category/';
            const response = await api.get(url);
            const result = response.data;

            if (Array.isArray(result)) {
                setCategories(result.map(cat => ({ 
                    ...cat, 
                    is_active: cat.is_active !== false,
                    priority: cat.priority || 0  // ✅ Default priority
                })));
            } else if (result.success && result.data) {
                setCategories(Array.isArray(result.data) ? result.data.map(cat => ({ 
                    ...cat, 
                    is_active: cat.is_active !== false,
                    priority: cat.priority || 0
                })) : []);
            } else if (result.results) {
                setCategories(result.results.map(cat => ({ 
                    ...cat, 
                    is_active: cat.is_active !== false,
                    priority: cat.priority || 0
                })));
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = !searchQuery || 
            category.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = languageFilter === 'ALL' || 
            category.language === languageFilter;
        return matchesSearch && matchesLanguage;
    });

    // ✅ Sort by priority (high to low)
    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.name.localeCompare(b.name);
    });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
        const payload = {
            name: formData.name.trim(),
            language: formData.language,
            is_active: formData.is_active,
            parent_id: formData.parent_id,
            priority: parseInt(formData.priority) || 0
        };

        // ✅ DEBUG: Log what we're sending
        console.log('📤 ====== SAVING CATEGORY ======');
        console.log('📤 Category ID:', editingId);
        console.log('📤 Payload:', JSON.stringify(payload, null, 2));

        let response;
        if (editingId) {
            response = await api.put(`/backoffice/category/${editingId}/update/`, payload);
            console.log('📥 Update Response:', response.data);
        } else {
            response = await api.post('/backoffice/category/create/', payload);
            console.log('📥 Create Response:', response.data);
        }

        console.log('📤 ==============================');

        setIsModalOpen(false);
        resetForm();
        
        // ✅ Force refresh
        await fetchCategories();

    } catch (error) {
        console.error('❌ Error saving category:', error);
        console.error('❌ Error details:', error.response?.data);
        alert(error.response?.data?.message || 'Failed to save category');
    } finally {
        setSaving(false);
    }
};

    // ✅ Quick priority update function
    const handleQuickPriorityChange = async (categoryId, newPriority) => {
        try {
            await api.put(`/backoffice/category/${categoryId}/update/`, {
                priority: newPriority
            });
            fetchCategories();
        } catch (error) {
            console.error('❌ Error updating priority:', error);
            alert('Failed to update priority');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await api.delete(`/backoffice/category/${id}/delete/`);
                fetchCategories();
            } catch (error) {
                console.error('❌ Error deleting category:', error);
                alert(error.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name || '',
            language: category.language || 'HINDI',
            is_active: category.is_active !== undefined ? category.is_active : true,
            parent_id: category.parent_id || null,
            priority: category.priority || 0  // ✅ Set priority when editing
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            language: 'HINDI',
            is_active: true,
            parent_id: null,
            priority: 0  // ✅ Reset priority
        });
    };

    const getLanguageLabel = (code) => {
        const lang = languageOptions.find(l => l.value === code);
        return lang ? lang.label : code;
    };

    const getParentCategoryName = (parentId) => {
        const parent = categories.find(cat => cat.id === parentId);
        return parent ? parent.name : '—';
    };

    // ✅ Get priority badge style
    const getPriorityBadge = (priority) => {
        if (priority >= 8) {
            return { bg: 'bg-red-100', text: 'text-red-800', icon: '⭐', label: 'Very High' };
        } else if (priority >= 5) {
            return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🔥', label: 'High' };
        } else if (priority >= 3) {
            return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '📌', label: 'Medium' };
        } else if (priority >= 1) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📋', label: 'Low' };
        } else {
            return { bg: 'bg-gray-100', text: 'text-gray-600', icon: '📁', label: 'Dropdown' };
        }
    };

    const languageCounts = categories.reduce((counts, category) => {
        counts[category.language] = (counts[category.language] || 0) + 1;
        return counts;
    }, {});

    // ✅ Count categories by priority
    const headerCount = categories.filter(c => c.priority >= 1).length;
    const dropdownCount = categories.filter(c => c.priority === 0).length;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-black">
                            📂 Manage Categories
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isAdmin 
                                ? 'Create, edit, and set priority for categories'
                                : 'View and manage categories (read-only)'
                            }
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={fetchCategories}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            disabled={loading}
                        >
                            🔄 Refresh All
                        </button>
                        {isAdmin && (
                            <button
                                onClick={handleAddNew}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Plus size={18} /> Add Category
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ Priority Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                        <div className="text-2xl font-bold text-green-600">{headerCount}</div>
                        <div className="text-sm text-gray-600">Header Categories</div>
                        <div className="text-xs text-gray-400">Priority ≥ 1</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
                        <div className="text-2xl font-bold text-gray-600">{dropdownCount}</div>
                        <div className="text-sm text-gray-600">Dropdown Categories</div>
                        <div className="text-xs text-gray-400">Priority = 0</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                        <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                        <div className="text-sm text-gray-600">Total Categories</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                        <div className="text-2xl font-bold text-purple-600">14</div>
                        <div className="text-sm text-gray-600">Max Header Slots</div>
                        <div className="text-xs text-gray-400">
                            {headerCount > 14 ? `⚠️ ${headerCount - 14} overflow` : `✅ ${14 - headerCount} available`}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">
                                Search Categories
                            </label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by category name..."
                                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Language Filter */}
                        <div className="md:w-64">
                            <label className="block text-sm font-medium text-black mb-1">
                                Filter by Language
                            </label>
                            <div className="relative">
                                <select
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="ALL">
                                        🌍 All Languages ({categories.length})
                                    </option>
                                    {languageOptions.map((lang) => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label} ({languageCounts[lang.value] || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || languageFilter !== 'ALL') && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setLanguageFilter('ALL');
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter Results */}
                    {(searchQuery || languageFilter !== 'ALL') && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                            <span>Showing: </span>
                            <span className="font-medium text-blue-600">{filteredCategories.length}</span>
                            <span>of {categories.length} categories</span>
                        </div>
                    )}
                </div>

                {/* ✅ Priority Legend */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Priority Guide:</h3>
                    <div className="flex flex-wrap gap-3">
                        {priorityOptions.map((opt) => {
                            const badge = getPriorityBadge(opt.value);
                            return (
                                <div key={opt.value} className={`px-3 py-1.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                    {badge.icon} {opt.value}: {opt.value >= 1 ? 'Header' : 'Dropdown'}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Parent
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Language
                                    </th>
                                    {/* ✅ Priority Column */}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        {isAdmin ? 'Actions' : 'Access'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : sortedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchQuery || languageFilter !== 'ALL' ? (
                                                <>No categories match your filters</>
                                            ) : (
                                                <>
                                                    No categories found
                                                    {isAdmin && (
                                                        <p className="mt-2 text-sm">Click "Add Category" to create one</p>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    sortedCategories.flatMap((category, index) => {
                                        const priorityBadge = getPriorityBadge(category.priority);
                                        
                                        const rows = [
                                            <tr key={category.id} className={`hover:bg-gray-50 ${category.priority >= 1 ? 'bg-green-50/30' : ''}`}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-black">
                                                        {category.name}
                                                    </span>
                                                    {category.children && category.children.length > 0 && (
                                                        <span className="ml-2 text-xs text-gray-400">
                                                            ({category.children.length} sub)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        {getParentCategoryName(category.parent_id)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                        {getLanguageLabel(category.language)}
                                                    </span>
                                                </td>
                                                {/* ✅ Priority Cell with Quick Actions */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorityBadge.bg} ${priorityBadge.text}`}>
                                                            {priorityBadge.icon} {category.priority}
                                                        </span>
                                                        {isAdmin && (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleQuickPriorityChange(category.id, Math.min(10, (category.priority || 0) + 1))}
                                                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                    title="Increase Priority"
                                                                    disabled={category.priority >= 10}
                                                                >
                                                                    <ArrowUp size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleQuickPriorityChange(category.id, Math.max(0, (category.priority || 0) - 1))}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Decrease Priority"
                                                                    disabled={category.priority <= 0}
                                                                >
                                                                    <ArrowDown size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* ✅ Location indicator */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {category.priority >= 1 ? (
                                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                            📍 Navbar
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                            📁 More Menu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {category.is_active ? '✅ Active' : '❌ Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {isAdmin ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(category)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(category.id, category.name)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Eye size={16} />
                                                            <span className="text-xs">View Only</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ];

                                        // Add child categories with indentation
                                        if (category.children && category.children.length > 0) {
                                            category.children.forEach((child, childIndex) => {
                                                const childPriorityBadge = getPriorityBadge(child.priority || 0);
                                                rows.push(
                                                    <tr key={`${category.id}-${child.id}`} className="hover:bg-gray-50 bg-gray-50/50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {index + 1}.{childIndex + 1}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap pl-8">
                                                            <span className="text-sm text-gray-600">
                                                                ↳ {child.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="text-sm text-gray-500">
                                                                {category.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                                                                {getLanguageLabel(category.language)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${childPriorityBadge.bg} ${childPriorityBadge.text}`}>
                                                                {child.priority || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="text-xs text-gray-400">
                                                                (under parent)
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                                                                ✅
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {isAdmin ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleEdit({ ...child, parent_id: category.id, language: category.language })}
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(child.id, child.name)}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <Eye size={14} className="text-gray-400" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        }

                                        return rows;
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    {sortedCategories.length > 0 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Showing: <span className="font-medium text-black">{filteredCategories.length}</span>
                                {(searchQuery || languageFilter !== 'ALL') && ` of ${categories.length}`} categories
                                <span className="ml-4 text-green-600">
                                    ({headerCount} in header, {dropdownCount} in dropdown)
                                </span>
                            </p>
                            {!isAdmin && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Lock size={12} />
                                    Read-only access
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-black">
                                    {editingId ? '✏️ Edit Category' : '➕ Add New Category'}
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {/* Category Name */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., राजनीति, Sports, Entertainment"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors"
                                        required
                                    />
                                </div>

                                {/* Parent Category */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Parent Category
                                    </label>
                                    <select
                                        value={formData.parent_id || ''}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            parent_id: e.target.value ? e.target.value : null 
                                        })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors"
                                    >
                                        <option value="">-- No Parent (Top Level) --</option>
                                        {categories
                                            .filter(cat => cat.id !== editingId && cat.language === formData.language && !cat.parent_id)
                                            .map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty for top-level category
                                    </p>
                                </div>

                                {/* Language */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Language <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value, parent_id: null })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors"
                                        required
                                    >
                                        {languageOptions.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* ✅ Priority Field */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Priority (for Navbar position)
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black transition-colors"
                                    >
                                        {priorityOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Priority Input for custom value */}
                                    <div className="mt-2">
                                        <label className="text-xs text-gray-500">Or enter custom value (0-10):</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black text-sm"
                                        />
                                    </div>

                                    {/* Priority Preview */}
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                                        <div className="flex items-center gap-2">
                                            {formData.priority >= 1 ? (
                                                <>
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        📍 Will appear in Navbar
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        (Position: {formData.priority >= 8 ? 'First' : formData.priority >= 5 ? 'Early' : 'Later'})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                    📁 Will appear in "More" dropdown only
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={formData.is_active === true}
                                                onChange={() => setFormData({ ...formData, is_active: true })}
                                                className="w-4 h-4 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-black">✅ Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={formData.is_active === false}
                                                onChange={() => setFormData({ ...formData, is_active: false })}
                                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-black">❌ Inactive</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsModalOpen(false); resetForm(); }}
                                        className="px-5 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-black"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || !formData.name.trim()}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ManageCategories;