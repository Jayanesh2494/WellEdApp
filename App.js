import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { testBackendConnection } from './src/services/api';

export default function App() {
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    console.log('🚀 App starting...');
    const result = await testBackendConnection();
    
    if (result.success) {
      console.log('✅ Backend connected successfully!');
      console.log('📍 API Status:', result.data);
    } else {
      console.error('⚠️ Backend connection issue. App will retry on first action.');
    }
  };

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
