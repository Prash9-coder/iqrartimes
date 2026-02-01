// src/utils/api.js - ✅ COMPLETE REWRITE

import axios from 'axios';

// ✅ Backend API URL - Clean, no extra paths
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.iqrartimes.com';

// ✅ Remove trailing slash if exists
const cleanBaseURL = BASE_URL.replace(/\/+$/, '');

const api = axios.create({
    baseURL: cleanBaseURL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Add token if exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug log
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);

        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.config?.url);

        // Handle 401 - Redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════
// ✅ AUTH SERVICES
// ═══════════════════════════════════════════════════════════

export const authService = {
    sendOtp: (email) => api.post('/user/send-email-otp', { email }),
    verifyOtp: (email, otp) => api.post('/user/verify-otp', { email, otp }),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isAuthenticated: () => !!localStorage.getItem('token'),
};

// ═══════════════════════════════════════════════════════════
// ✅ NEWS SERVICES
// ═══════════════════════════════════════════════════════════

export const newsService = {
    getAll: (language = 'ENGLISH') => api.get('/news', { params: { language } }),
    getById: (id) => api.get(`/news/${id}`),
    getByCategory: (categoryId) => api.get(`/news/category/${categoryId}`),
    search: (query) => api.get('/news/search', { params: { q: query } }),
};

// ═══════════════════════════════════════════════════════════
// ✅ CATEGORY SERVICES
// ═══════════════════════════════════════════════════════════

export const categoryService = {
    getAll: () => api.get('/category'),
    getById: (id) => api.get(`/category/${id}`),
};

// ═══════════════════════════════════════════════════════════
// ✅ EPAPER SERVICES (if needed)
// ═══════════════════════════════════════════════════════════

export const epaperService = {
    getAll: () => api.get('/epaper'),
    getById: (id) => api.get(`/epaper/${id}`),
    getByDate: (date) => api.get(`/epaper/date/${date}`),
};

export default api;