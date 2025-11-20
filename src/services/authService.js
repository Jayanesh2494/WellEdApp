import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (email, password, username) => {
  try {
    console.log('📝 Attempting registration for:', email);
    
    const response = await api.post('/auth/register', {
      email: email.trim().toLowerCase(),
      password: password,
      username: username.trim()
    });

    console.log('✅ Registration successful:', response.data.user);

    if (response.data.success) {
      // Store auth data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('lastActivity', Date.now().toString());
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    console.error('❌ Registration failed:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    return { 
      success: false, 
      error: error.response?.data?.error || 'Registration failed. Please try again.' 
    };
  }
};

export const login = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);
    
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password: password
    });

    console.log('✅ Login successful:', response.data.user);

    if (response.data.success) {
      // Store auth data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('lastActivity', Date.now().toString());
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    console.error('❌ Login failed:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Server is waking up. Please try again in 30 seconds.';
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
