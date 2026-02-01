import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    ChevronRight,
    GripVertical,
    Eye,
    EyeOff,
    Folder,
    FileText,
    TrendingUp
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        nameEnglish: '',
        nameTelugu: '',
        slug: '',
        description: '',
        parentId: null,
        icon: '',
        color: '#3B82F6',
        status: 'active',
        order: 0,
        showInMenu: true,
        showInFooter: true,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
    });

    const colorOptions = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Yellow', value: '#F59E0B' },
        { name: 'Indigo', value: '#6366F1' }
    ];

    const iconOptions = [
        'newspaper', 'trophy', 'film', 'briefcase', 'cpu',
        'heart', 'book', 'shield', 'globe', 'zap'
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        // API call
        // const response = await getCategories();
        // setCategories(response.data);

        // Mock data with hierarchy
        setCategories([
            {
                id: 1,
                name: 'Politics',
                nameEnglish: 'Politics',
                nameTelugu: 'రాజకీయాలు',
                slug: 'politics',
                description: 'Political news and updates',
                parentId: null,
                icon: 'shield',
                color: '#3B82F6',
                status: 'active',
                order: 1,
                showInMenu: true,
                showInFooter: true,
                articleCount: 145,
                children: [
                    {
                        id: 11,
                        name: 'National Politics',
                        slug: 'national-politics',
                        parentId: 1,
                        status: 'active',
                        order: 1,
                        articleCount: 89
                    },
                    {
                        id: 12,
                        name: 'Local Politics',
                        slug: 'local-politics',
                        parentId: 1,
                        status: 'active',
                        order: 2,
                        articleCount: 56
                    }
                ]
            },
            {
                id: 2,
                name: 'Sports',
                nameEnglish: 'Sports',
                nameTelugu: 'క్రీడలు',
                slug: 'sports',
                description: 'Sports news and scores',
                parentId: null,
                icon: 'trophy',
                color: '#10B981',
                status: 'active',
                order: 2,
                showInMenu: true,
                showInFooter: true,
                articleCount: 234,
                children: []
            },
            {
                id: 3,
                name: 'Entertainment',
                nameEnglish: 'Entertainment',
                slug: 'entertainment',
                description: 'Movies, music, and celebrity news',
                parentId: null,
                icon: 'film',
                color: '#F59E0B',
                status: 'active',
                order: 3,
                showInMenu: true,
                showInFooter: false,
                articleCount: 189,
                children: []
            }
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Generate slug from name if not provided
        if (!formData.slug) {
            formData.slug = formData.name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
        }

        if (editingId) {
            // await updateCategory(editingId, formData);
            if (import.meta.env.DEV) console.log('Updating category:', editingId, formData);
        } else {
            // await createCategory(formData);
            if (import.meta.env.DEV) console.log('Creating category:', formData);
        }

        setIsModalOpen(false);
        resetForm();
        fetchCategories();
    };

    const handleDelete = async (id) => {
        const category = findCategoryById(id);

        if (category.children && category.children.length > 0) {
            alert('Cannot delete category with subcategories!');
            return;
        }

        if (category.articleCount > 0) {
            if (!window.confirm(`This category has ${category.articleCount} articles. Are you sure?`)) {
                return;
            }
        }

        // await deleteCategory(id);
        if (import.meta.env.DEV) console.log('Deleting category:', id);
        fetchCategories();
    };

    const handleEdit = (category) => {
        setFormData({
            ...category,
            parentId: category.parentId || null
        });
        setEditingId(category.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            nameEnglish: '',
            nameTelugu: '',
            slug: '',
            description: '',
            parentId: null,
            icon: '',
            color: '#3B82F6',
            status: 'active',
            order: 0,
            showInMenu: true,
            showInFooter: true,
            metaTitle: '',
            metaDescription: '',
            metaKeywords: ''
        });
        setEditingId(null);
    };

    const toggleExpand = (id) => {
        if (expandedCategories.includes(id)) {
            setExpandedCategories(expandedCategories.filter(catId => catId !== id));
        } else {
            setExpandedCategories([...expandedCategories, id]);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        // await updateCategoryStatus(id, newStatus);
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, status: newStatus } : cat
        ));
    };

    const findCategoryById = (id) => {
        for (const cat of categories) {
            if (cat.id === id) return cat;
            if (cat.children) {
                const found = cat.children.find(c => c.id === id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        setCategories(updatedItems);
        // await updateCategoryOrder(updatedItems);
    };

    const renderCategoryRow = (category, level = 0) => (
        <>
            <tr key={category.id} className="hover:bg-gray-50 border-b">
                <td className="px-6 py-4" style={{ paddingLeft: `${(level * 2) + 1.5}rem` }}>
                    <div className="flex items-center gap-2">
                        {category.children && category.children.length > 0 && (
                            <button
                                onClick={() => toggleExpand(category.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <ChevronRight
                                    size={16}
                                    className={`transition-transform ${expandedCategories.includes(category.id) ? 'rotate-90' : ''}`}
                                />
                            </button>
                        )}
                        <GripVertical size={16} className="text-gray-400 cursor-move" />
                        <div
                            className="w-8 h-8 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                        >
                            {category.icon ? (
                                <span className="text-sm">{category.icon}</span>
                            ) : (
                                <Folder size={16} />
                            )}
                        </div>
                        <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">/{category.slug}</div>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                        <div>🇬🇧 {category.nameEnglish || category.name}</div>
                        <div>🇮🇳 {category.nameTelugu || '-'}</div>
                    </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-semibold text-blue-600">{category.articleCount || 0}</span>
                    </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        onClick={() => toggleStatus(category.id, category.status)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${category.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                    >
                        {category.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                        {category.status}
                    </button>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 text-xs">
                        {category.showInMenu && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Menu</span>
                        )}
                        {category.showInFooter && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Footer</span>
                        )}
                    </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Render children */}
            {category.children &&
                category.children.length > 0 &&
                expandedCategories.includes(category.id) &&
                category.children.map(child => renderCategoryRow(child, level + 1))
            }
        </>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-gray-600 mt-1">Organize and manage news categories</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Category
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Categories</p>
                            <p className="text-2xl font-bold">{categories.length}</p>
                        </div>
                        <Folder className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {categories.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                        <Eye className="text-green-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">In Menu</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {categories.filter(c => c.showInMenu).length}
                            </p>
                        </div>
                        <TrendingUp className="text-purple-500" size={32} />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Articles</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {categories.reduce((acc, cat) => acc + (cat.articleCount || 0), 0)}
                            </p>
                        </div>
                        <FileText className="text-orange-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Translations
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Articles
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Visibility
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <Droppable droppableId="categories">
                            {(provided) => (
                                <tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="divide-y divide-gray-200"
                                >
                                    {categories.map((category, index) => (
                                        <Draggable
                                            key={category.id}
                                            draggableId={category.id.toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <React.Fragment>
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        {renderCategoryRow(category)}
                                                    </tr>
                                                </React.Fragment>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
                    <Folder size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories</h3>
                    <p className="text-gray-500 mb-4">Create your first category to organize articles</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add Category
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingId ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Basic Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category Name (English) *</label>
                                    <input
                                        type="text"
                                        value={formData.nameEnglish}
                                        onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category Name (Telugu)</label>
                                    <input
                                        type="text"
                                        value={formData.nameTelugu}
                                        onChange={(e) => setFormData({ ...formData, nameTelugu: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="category-slug"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Parent Category</label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories.filter(c => c.id !== editingId).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    />
                                </div>

                                {/* Appearance */}
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2 mt-4">Appearance</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Icon</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Icon</option>
                                        {iconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`w-full h-10 rounded-lg border-2 ${formData.color === color.value ? 'border-gray-800' : 'border-gray-200'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2 mt-4">Settings</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.showInMenu}
                                            onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Show in Main Menu</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.showInFooter}
                                            onChange={(e) => setFormData({ ...formData, showInFooter: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Show in Footer</span>
                                    </label>
                                </div>

                                {/* SEO */}
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-4 border-b pb-2 mt-4">SEO Settings</h3>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Meta Keywords (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.metaKeywords}
                                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;