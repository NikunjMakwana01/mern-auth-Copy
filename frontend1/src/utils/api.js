import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || '').trim() || 'http://localhost:5001',
  timeout: 60000, // 60 seconds for requests with file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const base = (config.baseURL || '').toString();
    const url = (config.url || '').toString();
    const full = `${base}${url}`;

    const path = (config.url || '').toString();
    const isAdminElections = path.startsWith('/api/elections') &&
      !path.includes('/available') &&
      !path.includes('/available-user') &&
      !path.includes('/meta') &&
      !path.includes('/results-public') &&
      !path.includes('/published-user');
    const isAdminCandidates = path.startsWith('/api/candidates');
    const isAdminEndpoint = full.includes('/api/admin') || full.includes('/api/admin-auth') || isAdminElections || isAdminCandidates;

    // Prefer admin token for admin endpoints; otherwise prefer user token
    if (isAdminEndpoint) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else {
        // Do not allow user tokens on admin endpoints
        delete config.headers.Authorization;
      }
    } else {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors that aren't network errors (to avoid spam)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Network errors are handled by components, don't spam console
      console.warn('Network error - request may retry');
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Profile management
export const updateProfile = async (profileData) => {
  try {
    console.log('Sending profile update request:', profileData);
    const response = await api.put('/api/users/profile', profileData);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

// Elections (user)
export const fetchAvailableElections = async () => {
  try {
    const response = await api.get('/api/elections/available-user');
    return response.data;
  } catch (error) {
    console.error('Fetch available elections error:', error);
    throw error;
  }
};

export default api;
