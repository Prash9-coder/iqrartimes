// src/api/categoryApi.js
import api from './index';

// Validation helpers
const validateId = (id) => {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        throw new Error('Invalid category ID: must be a non-empty string or number');
    }
};

const validateCategoryData = (data, isUpdate = false) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid category data: must be an object');
    }

    if (!isUpdate || data.name !== undefined) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
            throw new Error('Category name is required and must be a non-empty string');
        }
    }

    if (data.priority !== undefined && typeof data.priority !== 'number') {
        throw new Error('Priority must be a number');
    }
};

const categoryApi = {
    // GET /backoffice/category with optional parameters
    getAll: async (params = {}) => {
        try {
            const { parent_only = null, language = null } = params;
            const queryParams = new URLSearchParams();
            
            if (parent_only !== null) {
                queryParams.append('parent_only', parent_only);
            }
            if (language) {
                console.log('🔍 Fetching categories for language:', language);
                queryParams.append('language', language);
            }
            
            const url = queryParams.toString() ? `/backoffice/category/?${queryParams.toString()}` : '/backoffice/category/';
            console.log('🌐 API URL:', url);
            const response = await api.get(url);
            
            console.log('📡 API Response data:', response.data?.data || response.data);
            
            return {
                success: true,
                data: response.data?.success && Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
            };
        } catch (error) {
            console.error('❌ Get categories error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch categories',
                data: []
            };
        }
    },

    // Same as getAll (use /backoffice/category for all cases)
    getAllAdmin: async (params = {}) => {
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
            
            return {
                success: true,
                data: response.data?.success && Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
            };
        } catch (error) {
            console.error('❌ Get categories error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch categories',
                data: []
            };
        }
    },

    // GET /news/category with optional parameters
    getAllPublic: async (params = {}) => {
        try {
            const { parent_only = null, language = null } = params;
            const queryParams = new URLSearchParams();
            
            if (parent_only !== null) {
                queryParams.append('parent_only', parent_only);
            }
            if (language) {
                queryParams.append('language', language);
            }
            
            const url = queryParams.toString() ? `/news/category?${queryParams.toString()}` : '/news/category';
            const response = await api.get(url);
            
            return {
                success: true,
                data: response.data?.success && Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : [])
            };
        } catch (error) {
            console.error('❌ Get public categories error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch categories',
                data: []
            };
        }
    },

    // Get categories for news creation dropdown: 
    // - If a category has children, only show children
    // - If a category has no children, show the category itself
    getNewsCategories: async (language = null) => {
        try {
            const result = await categoryApi.getAll({ language });
            
            if (!result.success) {
                return { success: false, error: result.error, data: [] };
            }

            const allCategories = result.data;
            
            // Build category tree from flat list using parent_id
            const categoryMap = {};
            const rootCategories = [];
            
            allCategories.forEach(category => {
                categoryMap[category.id] = { ...category, children: [] };
            });
            
            allCategories.forEach(category => {
                if (category.parent_id) {
                    if (categoryMap[category.parent_id]) {
                        categoryMap[category.parent_id].children.push(categoryMap[category.id]);
                    }
                } else {
                    rootCategories.push(categoryMap[category.id]);
                }
            });
            
            // Filter categories for news dropdown
            const newsCategories = [];
            
            rootCategories.forEach(category => {
                // Check if category has children
                const hasChildren = category.children && category.children.length > 0;
                
                if (hasChildren) {
                    // If category has children, add only children to news categories
                    category.children.forEach(child => {
                        newsCategories.push({
                            ...child,
                            parent_id: category.id,
                            parent_name: category.name
                        });
                    });
                } else {
                    // If category has no children, add the category itself
                    newsCategories.push(category);
                }
            });
            
            console.log('📂 News categories after filtering:', newsCategories);
            
            return {
                success: true,
                data: newsCategories
            };
        } catch (error) {
            console.error('❌ Get news categories error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch news categories',
                data: []
            };
        }
    },

    // GET /backoffice/category/<id>/
    getById: async (id) => {
        try {
            validateId(id);
            const response = await api.get(`/backoffice/category/${id}/`);
            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Get category error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch category'
            };
        }
    },

    // POST /backoffice/category/create/
    create: async (categoryData) => {
        try {
            validateCategoryData(categoryData, false);
            console.log('📤 Creating category:', categoryData);

            const payload = {
                name: categoryData.name.trim(),
                language: categoryData.language || 'HINDI',
                is_active: categoryData.is_active !== undefined ? categoryData.is_active : true
            };

            const response = await api.post('/backoffice/category/create/', payload);

            console.log('✅ Create response:', response.data);

            if (response.data?.success === false) {
                throw new Error(response.data?.description || response.data?.message || 'Failed to create');
            }

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Create category error:', error);

            let errorMessage = error.response?.data?.description ||
                error.response?.data?.message ||
                error.message ||
                'Failed to create category';

            if (errorMessage.toLowerCase().includes('already exists')) {
                errorMessage = `Category "${categoryData.name}" already exists.`;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // PUT /backoffice/category/<id>/update/
    update: async (id, categoryData) => {
        try {
            validateId(id);
            validateCategoryData(categoryData, true);
            console.log('📤 Updating category:', id, categoryData);

            const payload = {};
            if (categoryData.name !== undefined) payload.name = categoryData.name.trim();
            if (categoryData.language !== undefined) payload.language = categoryData.language;
            if (categoryData.is_active !== undefined) payload.is_active = categoryData.is_active;

            const response = await api.put(`/backoffice/category/${id}/update/`, payload);

            console.log('✅ Update response:', response.data);

            if (response.data?.success === false) {
                throw new Error(response.data?.description || response.data?.message || 'Failed to update');
            }

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Update category error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update category'
            };
        }
    },

    // DELETE /backoffice/category/<id>/delete/
    delete: async (id) => {
        try {
            validateId(id);
            console.log('📤 Deleting category:', id);
            await api.delete(`/backoffice/category/${id}/delete/`);
            console.log('✅ Category deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ Delete category error:', error);

            if (error.response && error.response.status >= 200 && error.response.status < 300) {
                return { success: true };
            }

            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete category'
            };
        }
    }
};

export default categoryApi;