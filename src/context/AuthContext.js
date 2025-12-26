import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/authService';
import { CommonActions } from '@react-navigation/native';

export const AuthContext = createContext();

export const AuthProvider = ({ children, navigation }) => {
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
    try {
      await AsyncStorage.clear();
      setUser(null);

      // Reset navigation stack to Login after logout
      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }

      // For Web: optional page reload
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
