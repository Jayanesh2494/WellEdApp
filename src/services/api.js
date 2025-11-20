import axios from 'axios';

// ⭐ Your Render Backend URL
const API_URL = 'https://welled-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for Render cold starts
});

// Add token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        hasAuth: !!token
      });
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout - Server may be waking up');
      error.message = 'Server is starting up. Please try again in a moment.';
    } else if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    } else {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Test connection to backend
export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('📡 API URL:', API_URL);
    
    // Test with root endpoint
    const response = await axios.get('https://welled-backend.onrender.com/', { 
      timeout: 30000 
    });
    
    console.log('✅ Backend is reachable:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default api;
