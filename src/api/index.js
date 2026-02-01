// src/api/index.js
import axios from 'axios';
import Cookies from 'js-cookie';

// ✅ Get API URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.iqrartimes.com';

// ✅ Debug logging - KEEP THIS ON until fixed
console.log('🌐 ===== API CONFIGURATION =====');
console.log('🌐 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🌐 Using API_BASE_URL:', API_BASE_URL);
console.log('🌐 ================================');

// ✅ Validate URL
if (!API_BASE_URL || API_BASE_URL.startsWith('/')) {
    console.error('❌ ERROR: API_BASE_URL must be an absolute URL!');
    console.error('❌ Current value:', API_BASE_URL);
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// ✅ Enhanced Request Interceptor with timing
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('🚀 API Request:', config.method?.toUpperCase(), fullUrl);
        
        // Add request timestamp for timing
        config.metadata = { startTime: new Date() };

        const token = localStorage.getItem('authToken');
        if (token) {
            const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Enhanced Response Interceptor with timing
api.interceptors.response.use(
    (response) => {
        const duration = new Date() - response.config.metadata?.startTime;
        console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
        return response;
    },
    async (error) => {
        const duration = error.config?.metadata ? 
            new Date() - error.config.metadata.startTime : 'N/A';
        
        const status = error.response?.status;
        const url = error.config?.url || '';
        
        // ✅ Better error logging
        console.error('❌ ===== API ERROR =====');
        console.error('❌ URL:', error.config?.baseURL + url);
        console.error('❌ Status:', status || 'No response');
        console.error('❌ Message:', error.message);
        console.error('❌ Duration:', duration + 'ms');
        console.error('❌ Code:', error.code);
        
        if (error.code === 'ECONNABORTED') {
            console.error('❌ TIMEOUT: Server did not respond within 30 seconds');
            console.error('❌ Check if backend server is running!');
        }
        
        if (!error.response) {
            console.error('❌ NETWORK ERROR: Cannot reach server');
            console.error('❌ Possible causes:');
            console.error('   - Backend server is down');
            console.error('   - CORS blocking request');
            console.error('   - Wrong API URL');
            console.error('   - Network connectivity issue');
        }
        
        console.error('❌ ====================');

        // Handle 401
        if (status === 401) {
            const isAuthEndpoint = url.includes('/auth/') || 
                                   url.includes('/login') || 
                                   url.includes('/verify');
            
            if (!isAuthEndpoint) {
                forceLogout('Token expired or invalid');
            }
        }

        return Promise.reject(error);
    }
);

// Force Logout Function
const forceLogout = (reason = 'Session expired') => {
    console.log('🚨 Force Logout:', reason);
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    
    Cookies.remove('userData');
    Cookies.remove('authToken');
    
    sessionStorage.clear();

    if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);
    }
};

export { forceLogout };
export default api;

// Public API (no auth required)
export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});