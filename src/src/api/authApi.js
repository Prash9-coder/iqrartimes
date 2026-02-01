// src/api/authApi.js
import api from './index';
import Cookies from 'js-cookie';

/**
 * Helper: Extract name from email
 */
const extractNameFromEmail = (email) => {
    if (!email) return null;

    const namePart = email.split('@')[0];

    let name = namePart
        .replace(/[0-9]/g, '')
        .replace(/[._-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (name) {
        name = name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    if (!name) {
        name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    console.log('📧 extractNameFromEmail:', email, '→', name);
    return name;
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Normalize user role from API response
 */
const normalizeUserRole = (userData) => {
    if (!userData) return null;

    let userObject = userData;
    if (userData.user && typeof userData.user === 'object') {
        userObject = userData.user;
    }

    // Extract role
    let roleValue = null;
    if (userObject.user_role && Array.isArray(userObject.user_role) && userObject.user_role.length > 0) {
        roleValue = userObject.user_role[0];
    } else if (userObject.user_role && typeof userObject.user_role === 'string') {
        roleValue = userObject.user_role;
    } else if (userObject.role) {
        roleValue = userObject.role;
    }

    if (roleValue) {
        roleValue = roleValue.toString().toLowerCase().trim();
    }

    const roleMap = {
        'admin': 'admin',
        'reporter': 'reporter',
        'enduser': 'enduser',
        'user': 'enduser',
    };

    const normalizedRole = roleMap[roleValue] || 'enduser';

    // Extract name - check properly for empty/undefined
    let displayName = null;
    if (userObject.name && typeof userObject.name === 'string' && userObject.name.trim().length > 0) {
        displayName = userObject.name.trim();
    } else if (userObject.full_name && typeof userObject.full_name === 'string' && userObject.full_name.trim().length > 0) {
        displayName = userObject.full_name.trim();
    } else if (userObject.display_name && typeof userObject.display_name === 'string' && userObject.display_name.trim().length > 0) {
        displayName = userObject.display_name.trim();
    }

    // If no name found, extract from email
    if (!displayName && userObject.email) {
        displayName = extractNameFromEmail(userObject.email);
        console.log('👤 Name extracted from email:', displayName);
    }

    // If still no name and username is NOT a random hash, use it
    if (!displayName && userObject.username) {
        const username = userObject.username;
        if (!/^[a-f0-9]{6,}$/i.test(username)) {
            displayName = username.charAt(0).toUpperCase() + username.slice(1);
        }
    }

    // Fallback
    if (!displayName) {
        displayName = 'User';
    }

    console.log('👤 Final displayName:', displayName);

    return {
        ...userObject,
        name: displayName,
        role: normalizedRole,
        originalRole: userObject.user_role,
    };
};

/**
 *  Extract token from API response
 */
const extractToken = (responseData) => {
    return responseData?.token ||
        responseData?.access_token ||
        responseData?.accessToken ||
        responseData?.access ||
        responseData?.jwt ||
        responseData?.data?.token ||
        responseData?.data?.access_token ||
        responseData?.user?.token ||
        responseData?.user?.access_token ||
        null;
};

/**
 Extract refresh token from API response
 */
const extractRefreshToken = (responseData) => {
    return responseData?.refresh_token ||
        responseData?.refreshToken ||
        responseData?.refresh ||
        responseData?.data?.refresh_token ||
        responseData?.data?.refreshToken ||
        null;
};

/**
 * Save auth data to storage - ensures name exists
 */
const saveAuthData = (token, refreshToken, user) => {
    console.log("💾 ===== SAVING AUTH DATA =====");

    if (token) {
        localStorage.setItem('authToken', token);
        console.log("✅ Token saved:", token.substring(0, 30) + '...');
    } else {
        console.warn("⚠️ No token to save!");
    }

    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        console.log("✅ Refresh token saved");
    }

    if (user) {
        // DOUBLE CHECK: Ensure name exists before saving
        if (!user.name || user.name.trim().length === 0) {
            if (user.email) {
                user.name = extractNameFromEmail(user.email);
                console.log("📧 Name added from email:", user.name);
            } else {
                user.name = 'User';
            }
        }

        localStorage.setItem('userData', JSON.stringify(user));
        Cookies.set('userData', JSON.stringify(user), { secure: true, sameSite: 'strict' });
        console.log("✅ User data saved");
        console.log("   📧 Email:", user.email);
        console.log("   👤 Name:", user.name);
        console.log("   🔑 Role:", user.role);
    }

    console.log("================================");
};

/**
  Clear auth data from storage
 */
const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    Cookies.remove('userData');
    console.log("🧹 Auth data cleared");
};

const authApi = {
    // Send OTP
    sendOtp: async (email) => {
        try {
            const trimmedEmail = email.trim();

            if (!trimmedEmail) {
                return { success: false, error: 'Please enter your email address' };
            }

            if (!validateEmail(trimmedEmail)) {
                return { success: false, error: 'Please enter a valid email address' };
            }

            console.log("📧 Sending OTP to:", trimmedEmail);

            const response = await api.post('/user/send-email-otp', {
                email: trimmedEmail
            });

            const apiResponse = response.data;

            if (apiResponse.success || apiResponse.errorCode === 0) {
                return {
                    success: true,
                    data: apiResponse.data,
                    message: apiResponse.description || 'OTP sent successfully',
                };
            } else {
                return {
                    success: false,
                    error: apiResponse.description || 'Failed to send OTP',
                };
            }
        } catch (error) {
            console.error("❌ Send OTP Error:", error);
            return {
                success: false,
                error: error.response?.data?.description || 'Failed to send OTP',
            };
        }
    },

    // Verify OTP
    verifyOtp: async (email, otp) => {
        try {
            const trimmedEmail = email.trim();

            if (!trimmedEmail || !validateEmail(trimmedEmail)) {
                return { success: false, error: 'Invalid email address' };
            }

            if (!otp || !/^\d{4,6}$/.test(otp)) {
                return { success: false, error: 'Invalid OTP format' };
            }

            console.log("🔐 Verifying OTP for:", trimmedEmail);

            const response = await api.post('/user/verify-email-otp', {
                email: trimmedEmail,
                otp: parseInt(otp)
            });

            console.log("🔐 ===== FULL API RESPONSE =====");
            console.log("🔐 Data:", JSON.stringify(response.data, null, 2));
            console.log("================================");

            const apiResponse = response.data;

            if (apiResponse.success || apiResponse.errorCode === 0) {
                const responseData = apiResponse.data || apiResponse;

                // Extract tokens
                const token = extractToken(apiResponse) || extractToken(responseData);
                const refreshToken = extractRefreshToken(apiResponse) || extractRefreshToken(responseData);

                // Normalize user data with name extraction
                const normalizedUser = normalizeUserRole(responseData);

                console.log("🔑 Token:", token ? "YES" : "NO");
                console.log("👤 Email:", normalizedUser?.email);
                console.log("👤 Name:", normalizedUser?.name);
                console.log("👤 Role:", normalizedUser?.role);

                // Save to storage
                saveAuthData(token, refreshToken, normalizedUser);

                return {
                    success: true,
                    user: normalizedUser,
                    token: token,
                };
            } else {
                return {
                    success: false,
                    error: apiResponse.description || 'Verification failed',
                };
            }
        } catch (error) {
            console.error("❌ Verify OTP Error:", error);
            return {
                success: false,
                error: error.response?.data?.description || 'Invalid OTP',
            };
        }
    },

    // Verify Token
    verifyToken: async () => {
        try {
            const response = await api.get('/user/verify-token');
            const apiResponse = response.data;

            if (apiResponse.success || apiResponse.errorCode === 0) {
                const userData = apiResponse.data;
                const normalizedUser = normalizeUserRole(userData);
                return { success: true, user: normalizedUser };
            } else {
                return { success: false, error: apiResponse.description || 'Token verification failed' };
            }
        } catch (error) {
            console.error("Token verification error:", error.message);
            return { success: false, error: 'Token verification failed' };
        }
    },

    // Logout
    logout: () => {
        console.log('🚪 Logging out...');
        clearAuthData();
        sessionStorage.clear();
        console.log('✅ Logout complete');
        return { success: true };
    },

    // Check if authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData') || Cookies.get('userData');
        return !!(token || userData);
    },

    // Get stored user - ensures name exists
    getStoredUser: () => {
        try {
            let userData = localStorage.getItem('userData');
            if (!userData) {
                userData = Cookies.get('userData');
            }
            if (userData) {
                const user = JSON.parse(userData);

                // Ensure name exists when reading
                if (!user.name || user.name.trim().length === 0) {
                    if (user.email) {
                        user.name = extractNameFromEmail(user.email);
                        localStorage.setItem('userData', JSON.stringify(user));
                    }
                }

                return user;
            }
            return null;
        } catch (error) {
            console.error("Error parsing stored user:", error.message);
            return null;
        }
    },

    // Get token
    getToken: () => {
        return localStorage.getItem('authToken');
    },

    //Clear auth
    clearAuth: clearAuthData,
};

export default authApi;