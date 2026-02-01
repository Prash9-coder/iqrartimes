// src/api/userApi.js
import api from './index';

const userApi = {
    // GET all users
    getAll: async (filters = {}) => {
        try {
            let url = '/backoffice/user';
            const params = new URLSearchParams();

            // Add filters
            if (filters.role) {
                params.append('role', filters.role);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            console.log('📡 Fetching users:', url);
            const response = await api.get(url);

            return {
                success: true,
                data: response.data?.data || response.data?.results || response.data || []
            };
        } catch (error) {
            console.error('❌ Get users error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch users',
                data: []
            };
        }
    },

    // GET user by ID
    getById: async (id) => {
        try {
            console.log('📡 Fetching user:', id);
            const response = await api.get(`/backoffice/user/${id}`);

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Get user error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch user'
            };
        }
    },

    // UPDATE user role
    updateRole: async (id, roles) => {
        try {
            console.log('📡 Updating user role:', id, roles);

            // Ensure roles is an array
            const roleArray = Array.isArray(roles) ? roles : [roles];

            const response = await api.put(`/backoffice/user/${id}`, {
                user_role: roleArray
            });

            console.log('✅ Role updated:', response.data);

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Update role error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update user role'
            };
        }
    },

    // UPDATE user (general update)
    update: async (id, userData) => {
        try {
            console.log('📡 Updating user:', id, userData);
            const response = await api.put(`/backoffice/user/${id}`, userData);

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Update user error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update user'
            };
        }
    },

    // SEARCH users (by phone/email)
    search: async (query) => {
        try {
            console.log('📡 Searching users:', query);
            const response = await api.get(`/backoffice/user?search=${encodeURIComponent(query)}`);

            return {
                success: true,
                data: response.data?.data || response.data?.results || response.data || []
            };
        } catch (error) {
            console.error('❌ Search users error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to search users',
                data: []
            };
        }
    },

    // FILTER by role
    getByRole: async (role) => {
        try {
            console.log('📡 Fetching users by role:', role);
            const response = await api.get(`/backoffice/user?role=${role}`);

            return {
                success: true,
                data: response.data?.data || response.data?.results || response.data || []
            };
        } catch (error) {
            console.error('❌ Get users by role error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch users',
                data: []
            };
        }
    }
};

export default userApi;