import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    console.log('=== LOGOUT STARTED ===');
    
    try {
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage cleared');
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Browser storage cleared');
      }
      
      setUser(null);
      console.log('✅ User state cleared');
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🔄 Reloading page...');
          window.location.href = '/';
        }
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  // Add refresh user function
  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return user;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
