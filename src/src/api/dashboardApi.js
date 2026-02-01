// src/api/dashboardApi.js

import api from './index';

const dashboardApi = {
    /**
     * GET Dashboard Stats
     */
    getStats: async () => {
        try {
            console.log('📊 Fetching dashboard stats...');
            const response = await api.get('/backoffice/dashboard');

            console.log('✅ Dashboard response:', response.data);

            // API returns: { success, errorCode, description, data: {...} }
            if (response.data?.success || response.data?.errorCode === 0) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                error: response.data?.description || 'Failed to fetch dashboard',
                data: null
            };
        } catch (error) {
            console.error('❌ Dashboard Error:', error.message);
            return {
                success: false,
                error: error.response?.data?.description || error.message,
                data: null
            };
        }
    }
};

export default dashboardApi;