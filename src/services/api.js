import axios from 'axios';

// ⭐ PUT YOUR RENDER BACKEND URL HERE
const API_URL = 'https://welled-backend.onrender.com/api';
// Example: 'https://welled-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds for Render free tier (can be slow on cold start)
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout - Render may be starting up');
    }
    return Promise.reject(error);
  }
);

export default api;
