// src/api/newsApi.js
import api from './index';

const newsApi = {
    // GET /news/news
    getAll: async () => {
        try {
            const response = await api.get('/news/news');
            if (response.data?.success === false) {
                const errorMessage = response.data?.description || response.data?.message || response.data?.error;
                if (errorMessage && errorMessage !== 'Request Successful') {
                    return { success: false, error: errorMessage, data: [] };
                }
            }
            return {
                success: true,
                data: response.data?.data || response.data?.results || response.data || []
            };
        } catch (error) {
            console.error('❌ Get news error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.response?.data?.message || 'Failed to fetch news',
                data: []
            };
        }
    },

    // GET news by status - Client-side filtering
    getByStatus: async (status) => {
        try {
            console.log('📡 Fetching news with status:', status);
            let response;
            try {
                response = await api.get('/news/news', {
                    params: { status }
                });
            } catch (e) {
                response = await api.get('/news/news');
            }

            let allNews = response.data?.data || response.data?.results || response.data || [];

            // Ensure it's an array
            if (!Array.isArray(allNews)) {
                allNews = [];
            }

            console.log('📰 Total news fetched:', allNews.length);

            // Client-side filter by status
            const filteredNews = allNews.filter(item => {
                const itemStatus = (item.status || 'Pending').toLowerCase();
                const filterStatus = status.toLowerCase();
                return itemStatus === filterStatus;
            });

            console.log('✅ Filtered by status "' + status + '":', filteredNews.length, 'articles');

            return {
                success: true,
                data: filteredNews
            };
        } catch (error) {
            console.error('❌ Get news by status error:', error);
            return {
                success: false,
                error: error.response?.data?.description || 'Failed to fetch news',
                data: []
            };
        }
    },

    // GET single news
    getById: async (id) => {
        if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
            return { success: false, error: 'Invalid id' };
        }
        try {
            const response = await api.get(`/news/news/${id}`);
            if (response.data?.success === false) {
                const errorMessage = response.data?.description || response.data?.message || response.data?.error;
                if (errorMessage && errorMessage !== 'Request Successful') {
                    return { success: false, error: errorMessage };
                }
            }
            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Get news error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.response?.data?.message || 'Failed to fetch news'
            };
        }
    },

    // POST /backoffice/news 
    create: async (newsData) => {
        if (!newsData || typeof newsData !== 'object') {
            return { success: false, error: 'Invalid news data' };
        }
        try {
            // Ensure status is always Pending for new articles
            const payload = {
                ...newsData,
                status: 'Pending'
            };

            console.log('📤 Creating news with payload:', payload);

            const response = await api.post('/backoffice/news', payload);

            console.log('📦 Create response:', response.data);

            if (response.data?.success === false) {
                const errorMessage = response.data?.description ||
                    response.data?.message ||
                    response.data?.error;

                if (errorMessage && errorMessage !== 'Request Successful') {
                    console.error('❌ Backend error:', errorMessage);
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            }

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Create news error:', error);
            console.error('❌ Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.description ||
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to create news'
            };
        }
    },

    // PUT /backoffice/news
    update: async (id, newsData) => {
        if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
            return { success: false, error: 'Invalid id' };
        }
        if (!newsData || typeof newsData !== 'object') {
            return { success: false, error: 'Invalid news data' };
        }
        try {
            console.log('📤 Updating news:', id, newsData);

            const response = await api.put(`/backoffice/news/${id}`, newsData);

            console.log('📦 Update response:', response.data);

            if (response.data?.success === false) {
                const errorMessage = response.data?.description ||
                    response.data?.message ||
                    response.data?.error;

                if (errorMessage && errorMessage !== 'Request Successful') {
                    console.error('❌ Backend error:', errorMessage);
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            }

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Update news error:', error);
            return {
                success: false,
                error: error.response?.data?.description ||
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to update news'
            };
        }
    },

    // Update status (Approve/Reject)
    updateStatus: async (id, status, rejectionReason = null) => {
        if (!id) {
            return { success: false, error: 'Invalid id' };
        }
        if (!status) {
            return { success: false, error: 'Status is required' };
        }

        try {
            console.log('📡 Updating news status:', id, '→', status);

            const payload = { status };

            if (rejectionReason) {
                payload.rejection_reason = rejectionReason;
            }

            const response = await api.put(`/backoffice/news/${id}`, payload);

            console.log('✅ Status update response:', response.data);

            if (response.data?.success === false) {
                const errorMessage = response.data?.description || response.data?.message;
                if (errorMessage && errorMessage !== 'Request Successful') {
                    return { success: false, error: errorMessage };
                }
            }

            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('❌ Update status error:', error);
            return {
                success: false,
                error: error.response?.data?.description ||
                    error.response?.data?.message ||
                    'Failed to update status'
            };
        }
    },

    // DELETE /backoffice/news
    delete: async (id) => {
        if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
            return { success: false, error: 'Invalid id' };
        }
        try {
            console.log('📤 Deleting news:', id);

            const response = await api.delete(`/backoffice/news/${id}`);

            console.log('📦 Delete response:', response.data);

            if (response.data?.success === false) {
                const errorMessage = response.data?.description || response.data?.message;
                if (errorMessage && errorMessage !== 'Request Successful') {
                    return { success: false, error: errorMessage };
                }
            }

            return { success: true, data: null };
        } catch (error) {
            console.error('❌ Delete news error:', error);

            if (error.response && error.response.status >= 200 && error.response.status < 300) {
                return { success: true, data: null };
            }

            return {
                success: false,
                error: error.response?.data?.description ||
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to delete news'
            };
        }
    }
};

export default newsApi;