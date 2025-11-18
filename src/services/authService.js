import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (email, password, username) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      username
    });

    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('lastActivity', Date.now().toString());
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Registration failed' 
    };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('lastActivity', Date.now().toString());
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

export const logout = async () => {
  try {
    console.log('🚪 Logging out - Clearing all storage');
    
    // Clear AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('lastActivity');
    
    // FORCE clear all AsyncStorage
    await AsyncStorage.clear();
    
    console.log('✅ Storage cleared');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};
