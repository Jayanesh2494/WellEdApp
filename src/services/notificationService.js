import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  // Skip notifications on web platform
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  let token;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  } catch (error) {
    console.log('Error getting push token:', error.message);
    return null;
  }
  
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.log('Error setting notification channel:', error.message);
    }
  }
  
  return token;
};

export const scheduleDailyReminders = async () => {
  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('Scheduled notifications are not supported on web');
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const reminders = [
      { hour: 9, minute: 0, message: 'Good morning! Complete your wellness tasks today!' },
      { hour: 12, minute: 0, message: 'Time for your posture check — sit upright and relax shoulders.' },
      { hour: 14, minute: 0, message: 'Drink a glass of water now.' },
      { hour: 16, minute: 0, message: 'Step outside for 10 minutes of sunlight.' },
      { hour: 20, minute: 0, message: 'Have you completed all your tasks today?' }
    ];
    
    for (const reminder of reminders) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'WellEd Reminder',
          body: reminder.message,
          sound: true,
        },
        trigger: {
          hour: reminder.hour,
          minute: reminder.minute,
          repeats: true,
        },
      });
    }
    
    console.log('Daily reminders scheduled successfully');
  } catch (error) {
    console.log('Error scheduling notifications:', error.message);
  }
};
