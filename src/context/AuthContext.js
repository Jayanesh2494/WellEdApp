import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/authService';
import { Platform } from 'react-native';

export const AuthContext = createContext();

const SESSION_TIMEOUT = 5 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const lastActivity = await AsyncStorage.getItem('lastActivity');
      
      if (token && lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        
        if (timeSinceActivity > SESSION_TIMEOUT) {
          await AsyncStorage.clear();
          setUser(null);
        } else {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    console.log('=== LOGOUT STARTED ===');
    
    try {
      // Step 1: Clear AsyncStorage
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage cleared');
      
      // Step 2: Clear user state
      setUser(null);
      console.log('✅ User state cleared');
      
      // Step 3: Force reload page (works on web)
      if (Platform.OS === 'web') {
        console.log('🔄 Reloading page...');
        
        // Multiple reload methods for compatibility
        try {
          window.location.replace('/');
        } catch (e) {
          window.location.href = '/';
        }
      }
      
      console.log('=== LOGOUT COMPLETE ===');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force reload anyway
      if (Platform.OS === 'web') {
        window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
