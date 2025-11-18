import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';
import { 
  requestNotificationPermissions, 
  scheduleDailyReminder 
} from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    if (Platform.OS !== 'web') {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleDailyReminder();
      }
    }
  };

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
