import React, { createContext, useContext, useState, useEffect } from 'react';

// Get API base URL from environment variable (Vite uses import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_ROOT = `${API_BASE_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to clear auth data
    const clearAuthData = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('deviceId');
        setToken(null);
        setUser(null);
    };

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } else {
            // Clear any stale data
            clearAuthData();
        }
        setLoading(false);
    }, []);

    // Listen for unauthorized errors from API
    useEffect(() => {
        const handleUnauthorized = () => {
            clearAuthData();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        };

        // Listen for custom event dispatched from api.js
        window.addEventListener('unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('unauthorized', handleUnauthorized);
        };
    }, []);

    /**
     * Request OTP for email
     */
    const requestOtp = async (email) => {
        try {
            const response = await fetch(`${API_ROOT}/auth/request-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to request OTP');
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Verify OTP and login
     */
    const verifyOtp = async (email, otp, logoutFromOtherDevices = false) => {
        try {
            // Generate device ID if not exists
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
                deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('deviceId', deviceId);
            }

            const deviceInfo = navigator.userAgent;

            const response = await fetch(`${API_ROOT}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    deviceId,
                    deviceInfo,
                    logoutFromOtherDevices
                }),
            });

            if (!response.ok) {
                const error = await response.json();

                // Handle 409 Conflict - user logged in on another device
                if (response.status === 409 && error.canLogoutFromOtherDevices) {
                    return {
                        success: false,
                        error: error.message,
                        conflict: true,
                        sessions: error.sessions || []
                    };
                }

                throw new Error(error.message || 'OTP verification failed');
            }

            const data = await response.json();

            // Store access token, refresh token, and user info
            const tokenToStore = data.accessToken || data.token;
            localStorage.setItem('adminToken', tokenToStore);
            if (data.refreshToken) {
                localStorage.setItem('adminRefreshToken', data.refreshToken);
            }
            localStorage.setItem('adminUser', JSON.stringify(data.user));

            setToken(tokenToStore);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Legacy email/password login (kept for backward compatibility)
     */
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_ROOT}/auth/legacy/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();

            // Store token and user info
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify({
                _id: data._id,
                email: data.email,
                role: data.role,
            }));

            setToken(data.token);
            setUser({
                _id: data._id,
                email: data.email,
                role: data.role,
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Logout and clear refresh token from backend
     */
    const logout = async () => {
        try {
            // Get refresh token from localStorage
            const refreshToken = localStorage.getItem('adminRefreshToken');

            // Call backend to delete refresh token if available
            if (refreshToken) {
                try {
                    await fetch(`${API_ROOT}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                    });
                } catch (error) {
                    // Even if API call fails, continue with local logout
                    console.error('Error calling logout API:', error);
                }
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Clear all auth data
            clearAuthData();
        }
    };

    const value = {
        user,
        token,
        loading,
        requestOtp,
        verifyOtp,
        login, // Legacy
        logout,
        clearAuthData, // Expose for manual clearing if needed
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
