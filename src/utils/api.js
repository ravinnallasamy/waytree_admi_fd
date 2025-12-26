// API Configuration and Helper Functions

// Get API base URL from environment variable (Vite uses import.meta.env)
// Default to localhost for development
// Default to Render URL for production/demo if env var not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waytree-bc.onrender.com';

// Helper function to make authenticated API calls
export const fetchWithAuth = async (endpoint, options = {}) => {
    // Ensure endpoint starts with a slash
    let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Add /api prefix if not already present and not an external URL
    if (!endpoint.startsWith('http') && !normalizedEndpoint.startsWith('/api/')) {
        normalizedEndpoint = `/api${normalizedEndpoint}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${normalizedEndpoint}`;

    // Log the request for debugging
    console.log(`🌐 [API] ${options.method || 'GET'} ${url}`);

    // Get token from localStorage
    const token = localStorage.getItem('adminToken');

    console.log('🌐 [API] Making request to:', url);
    console.log('🎫 [API] Token present:', !!token);
    if (token) {
        console.log('🎫 [API] Token preview:', token.substring(0, 20) + '...');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    console.log('📋 [API] Request headers:', headers);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log('📡 [API] Response status:', response.status, response.statusText);

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                // If we are already trying to refresh, or this is a refresh attempt failing, logout
                if (url.includes('/auth/refresh')) {
                    console.error('❌ [API] Refresh token expired or invalid - logging out');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminRefreshToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('deviceId');
                    window.dispatchEvent(new CustomEvent('unauthorized'));
                    return { error: 'Unauthorized' };
                }

                console.log('🔄 [API] Access token expired, attempting refresh...');
                const refreshToken = localStorage.getItem('adminRefreshToken');

                if (refreshToken) {
                    try {
                        // Attempt to refresh token
                        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken })
                        });

                        if (refreshResponse.ok) {
                            const data = await refreshResponse.json();
                            const newAccessToken = data.accessToken;

                            console.log('✅ [API] Token refreshed successfully');

                            // Update local storage
                            localStorage.setItem('adminToken', newAccessToken);

                            // Update headers with new token
                            const newHeaders = {
                                ...headers,
                                'Authorization': `Bearer ${newAccessToken}`
                            };

                            // Retry original request
                            console.log('🔄 [API] Retrying original request...');
                            return await fetchWithAuth(endpoint, {
                                ...options,
                                headers: newHeaders // Pass updated headers prevents re-reading old token from localStorage immediately if we didn't recurse fetchWithAuth correctly, but recursion fetchWithAuth will read new token from localStorage
                            });
                        } else {
                            console.error('❌ [API] Token refresh failed');
                            throw new Error('Token refresh failed');
                        }
                    } catch (refreshError) {
                        console.error('❌ [API] Error refreshing token:', refreshError);
                        // Fall through to logout logic below
                    }
                } else {
                    console.log('ℹ️ [API] No refresh token available');
                }

                console.error('❌ [API] Unauthorized and refresh failed - clearing tokens and redirecting');

                // Clear all tokens and user data
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('deviceId');

                // Dispatch custom event to notify AuthContext
                window.dispatchEvent(new CustomEvent('unauthorized'));

                // Don't throw error here to prevent multiple redirects
                return { error: 'Unauthorized' };
            }

            // Try to parse error response as JSON
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }

            console.error('❌ [API] Error response:', {
                status: response.status,
                statusText: response.statusText,
                url,
                error: errorData
            });

            // Throw an error with the server's error message if available
            const error = new Error(errorData.message || 'API request failed');
            error.response = response;
            error.data = errorData;
            throw error;
        }

        // For 204 No Content responses, return null
        if (response.status === 204) {
            return null;
        }

        // Parse JSON response
        const data = await response.json();

        // Log successful response for debugging
        console.log('✅ [API] Request successful', {
            url,
            status: response.status,
            data: data ? (Array.isArray(data) ? `Array(${data.length})` : 'Object') : 'No data'
        });

        // For paginated responses, ensure consistent structure
        if (data && data.pagination) {
            return {
                ...data,
                // Ensure events is always an array
                events: Array.isArray(data.events) ? data.events : [],
                // Ensure pagination has all required fields
                pagination: {
                    page: data.pagination.page || 1,
                    limit: data.pagination.limit || 10,
                    total: data.pagination.total || 0,
                    totalPages: data.pagination.totalPages || 1,
                    ...data.pagination
                }
            };
        }

        return data;
    } catch (error) {
        console.error('❌ [API] Error:', error);
        throw error;
    }
};

// Convenience methods
export const api = {
    get: async (endpoint) => {
        const response = await fetchWithAuth(endpoint, { method: 'GET' });
        return response;
    },
    post: async (endpoint, data) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    },
    put: async (endpoint, data) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    },
    delete: async (endpoint) => {
        const response = await fetchWithAuth(endpoint, {
            method: 'DELETE'
        });
        return response;
    },
};

export default api;
