import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Function to check if a token is expired
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    } catch (error) {
        console.error('🔴 Invalid Token:', error);
        return true;
    }
};

// Request Interceptor: Attach token & refresh if expired
apiClient.interceptors.request.use(async (config) => {
    let token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        console.error('🔴 Refresh token missing! Redirecting to login...');
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(new Error('Refresh token not found'));
    }

    if (token && isTokenExpired(token)) {
        console.log('🔄 Token expired! Refreshing...');
        try {
            const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
            token = response.data.access;
            localStorage.setItem('access_token', token);
            console.log('✅ New Token:', token);
        } catch (error) {
            console.error('🔴 Token refresh failed:', error);
            localStorage.clear();
            window.location.href = '/';
            return Promise.reject(error);
        }
    }

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 Unauthorized errors
apiClient.interceptors.response.use(
    response => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('🔴 Unauthorized! Redirecting to login...');
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ✅ Login function
export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post('/login/', credentials);
        return response.data;
    } catch (error) {
        console.error("🔴 Login failed:", error);
        throw error;
    }
};

// ✅ Fetch Messages function
export const fetchMessages = async (selectedUser) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        console.error("🔴 No access token found! Redirecting to login...");
        window.location.href = '/';
        return [];
    }

    try {
        const response = await apiClient.get(`/messages/?recipient_id=${selectedUser.id}`);
        console.log("📥 Fetched Messages:", response.data);
        return response.data;
    } catch (error) {
        console.error('🔴 Fetch Messages Error:', error.response?.data || error.message);
        return [];
    }
};

// ✅ Send Message function
export const sendMessage = async (selectedUser, messageText, selectedFile) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        console.error("🔴 No access token found! Redirecting to login...");
        window.location.href = '/';
        return;
    }

    const formData = new FormData();
    formData.append('recipient_id', selectedUser.id);
    formData.append('content', messageText);
    if (selectedFile) {
        formData.append('file', selectedFile);
    }

    console.log("📤 Sending Message:", formData);

    try {
        const response = await axios.post(`${API_BASE_URL}/send_message/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('✅ Message Sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('🔴 Send Message Error:', error.response?.data || error.message);
        throw error;
    }
};

export default apiClient;
