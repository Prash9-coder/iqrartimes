// src/api/commentApi.js
import axios from 'axios';

const API_BASE_URL = 'https://api.iqrartimes.com';

//Get token from correct key
const getToken = () => {
    const token = localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken');
    return token;
};

const commentApi = {
    // GET comments by news ID
    getByNewsId: async (newsId) => {
        if (!newsId) {
            return { success: true, data: [] };
        }

        try {
            console.log('📡 Fetching comments for news:', newsId);

            const token = getToken();
            console.log('🔑 Token found:', token ? 'Yes' : 'No');

            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(`${API_BASE_URL}/news/news/comment`, {
                headers
            });

            console.log('📦 Comments response:', response.data);

            const allComments = response.data?.data || response.data?.results || response.data || [];

            const filteredComments = allComments.filter(comment =>
                comment.news_id === newsId || comment.newsId === newsId
            );

            console.log('✅ Filtered comments:', filteredComments.length);

            return { success: true, data: filteredComments };

        } catch (error) {
            console.error('❌ Get comments error:', error.response?.status);

            if (error.response?.status === 401) {
                return { success: true, data: [] };
            }

            return { success: false, error: 'Failed to fetch comments', data: [] };
        }
    },

    // POST new comment
    create: async (newsId, commentText) => {
        if (!newsId || !commentText?.trim()) {
            return { success: false, error: 'Invalid data' };
        }

        const token = getToken();

        if (!token) {
            return { success: false, error: 'Please login to comment', authRequired: true };
        }

        try {
            console.log('📡 Posting comment...');

            const response = await axios.post(`${API_BASE_URL}/news/news/comment`, {
                news_id: newsId,
                comment: commentText.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Comment posted:', response.data);

            return { success: true, data: response.data?.data || response.data };

        } catch (error) {
            console.error('❌ Post comment error:', error);

            if (error.response?.status === 401) {
                return { success: false, error: 'Please login to comment', authRequired: true };
            }

            return { success: false, error: 'Failed to post comment' };
        }
    }
};

export default commentApi;