import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/services/authService';
import { registerForPushNotificationsAsync, scheduleDailyReminders } from './src/services/notificationService';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    // Only setup notifications on mobile platforms
    if (Platform.OS !== 'web') {
      try {
        await registerForPushNotificationsAsync();
        await scheduleDailyReminders();
      } catch (error) {
        console.log('Notification setup error:', error);
      }
    }
  };

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
