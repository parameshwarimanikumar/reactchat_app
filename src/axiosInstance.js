import axios from "axios";

// Create a base axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Your Django backend URL
});

// Function to refresh the token
const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token available");

    const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
      refresh,
    });

    localStorage.setItem("access", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login"; // Redirect to login if refresh fails
    return null;
  }
};

// Add JWT token to all requests
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration (401 errors)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and the token is expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we are already refreshing the token
      if (isRefreshing) {
        // Queue the request to retry once the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken); // Resolve all queued requests
          return axios(originalRequest); // Retry the original request
        }
      } catch (err) {
        processQueue(err, null); // Reject all queued requests
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
