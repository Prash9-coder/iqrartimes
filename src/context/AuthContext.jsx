// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { forceLogout as apiForceLogout } from '../api/index';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [otpEmailOrMobile, setOtpEmailOrMobile] = useState('');
    const navigate = useNavigate();

    // ✅ Centralized logout cleanup
    const handleLogoutCleanup = useCallback(() => {
        console.log('🧹 ===== LOGOUT CLEANUP =====');
        authApi.clearAuth();
        setUser(null);
        setOtpSent(false);
        setOtpEmailOrMobile('');
        console.log('✅ Context state cleared');
        console.log('=============================');
    }, []);

    // ✅ Check if token is expired (JWT decode)
    const isTokenExpired = useCallback((token) => {
        if (!token) return true;

        try {
            const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
            const parts = cleanToken.split('.');

            if (parts.length !== 3) {
                console.warn('⚠️ Invalid token format');
                return true;
            }

            const payload = JSON.parse(atob(parts[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const isExpired = now >= exp;

            if (isExpired) {
                console.warn('⚠️ Token EXPIRED!');
                console.warn('⚠️ Expired at:', new Date(exp).toLocaleString());
                console.warn('⚠️ Current time:', new Date(now).toLocaleString());
            } else {
                const remainingMs = exp - now;
                const remainingMins = Math.floor(remainingMs / 60000);
                console.log('✅ Token valid for:', remainingMins, 'minutes');
            }

            return isExpired;
        } catch (error) {
            console.error('❌ Token parse error:', error);
            return true;
        }
    }, []);

    // ✅ Check auth on mount
    const checkAuth = useCallback(async () => {
        console.log('🔍 ===== CHECKING AUTH =====');

        try {
            const token = localStorage.getItem('authToken');
            const storedUser = authApi.getStoredUser();

            console.log('🔑 Token exists:', !!token);
            console.log('👤 Stored user exists:', !!storedUser);

            // No auth data
            if (!token && !storedUser) {
                console.log('❌ No auth data found');
                setUser(null);
                setLoading(false);
                return;
            }

            // Check token expiry
            if (token && isTokenExpired(token)) {
                console.warn('🚨 Token is EXPIRED! Logging out...');
                handleLogoutCleanup();
                setLoading(false);

                // Don't redirect here, let ProtectedRoute handle it
                return;
            }

            // Valid token and user
            if (storedUser) {
                console.log('👤 User email:', storedUser.email);
                console.log('👤 User role:', storedUser.role);
                setUser(storedUser);
            }

            console.log('✅ Auth check complete');
        } catch (error) {
            console.error('❌ Auth check error:', error);
            handleLogoutCleanup();
        } finally {
            setLoading(false);
            console.log('================================');
        }
    }, [isTokenExpired, handleLogoutCleanup]);

    // ✅ Run auth check on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // ✅ Listen for storage changes (logout in other tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'authToken' && !e.newValue) {
                console.log('🔄 Auth token removed in another tab - syncing logout');
                handleLogoutCleanup();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [handleLogoutCleanup]);

    /**
     * Send OTP
     */
    const sendOtp = useCallback(async (emailOrMobile) => {
        try {
            const result = await authApi.sendOtp(emailOrMobile.trim());

            if (result.success) {
                setOtpSent(true);
                setOtpEmailOrMobile(emailOrMobile.trim());
                return {
                    success: true,
                    message: result.message || 'OTP sent successfully'
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to send OTP'
                };
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            return {
                success: false,
                error: 'Network error. Please try again.'
            };
        }
    }, []);

    /**
     * Verify OTP and login
     */
    const verifyOtp = useCallback(async (emailOrMobile, otp) => {
        try {
            const result = await authApi.verifyOtp(emailOrMobile.trim(), otp);

            console.log('🔐 ===== VERIFY OTP RESULT =====');
            console.log('🔐 Success:', result.success);
            console.log('🔐 User:', result.user?.email);
            console.log('🔐 Role:', result.user?.role);
            console.log('🔐 Token received:', result.token ? 'YES' : 'NO');
            console.log('================================');

            if (result.success && result.user) {
                setUser(result.user);
                setOtpSent(false);
                setOtpEmailOrMobile('');

                // Verify token was saved
                const savedToken = localStorage.getItem('authToken');
                console.log('✅ Token saved in localStorage:', !!savedToken);

                return {
                    success: true,
                    user: result.user
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Verification failed'
                };
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            return {
                success: false,
                error: 'Network error. Please try again.'
            };
        }
    }, []);

    /**
     * ✅ Logout - Complete cleanup
     */
    const logout = useCallback(async () => {
        console.log('🚪 ===== LOGOUT INITIATED =====');

        try {
            // Try to notify backend (optional, don't wait)
            authApi.logout().catch(() => { });
        } catch (e) {
            // Ignore backend logout errors
        }

        handleLogoutCleanup();
        navigate('/login', { replace: true });

        console.log('✅ Logout complete');
        console.log('================================');
    }, [navigate, handleLogoutCleanup]);

    /**
     * Get user role
     */
    const getUserRole = useCallback(() => {
        return user?.role || null;
    }, [user]);

    /**
     * Check if user has specific role(s)
     */
    const hasRole = useCallback((roles) => {
        if (!user?.role) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }, [user]);

    const canAccessAdminFeatures = useCallback(() => {
        return user?.role === 'admin';
    }, [user]);

    const canAccessReporterFeatures = useCallback(() => {
        return user?.role === 'admin' || user?.role === 'reporter';
    }, [user]);

    const getDashboardPath = useCallback(() => {
        if (!user?.role) return '/';

        switch (user.role) {
            case 'admin':
            case 'reporter':
                return '/admin';
            case 'enduser':
            default:
                return '/';
        }
    }, [user]);

    const getLoginRedirectPath = useCallback((role) => {
        switch (role) {
            case 'admin':
            case 'reporter':
                return '/admin';
            case 'enduser':
            default:
                return '/';
        }
    }, []);

    const value = {
        // State
        user,
        loading,
        otpSent,
        otpEmailOrMobile,

        // Auth status
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isReporter: user?.role === 'reporter' || user?.role === 'admin',
        isEndUser: user?.role === 'enduser',

        // Actions
        sendOtp,
        verifyOtp,
        logout,
        checkAuth,

        // Helpers
        getUserRole,
        hasRole,
        getDashboardPath,
        getLoginRedirectPath,

        // Permissions
        canAccessAdminFeatures,
        canAccessReporterFeatures,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;