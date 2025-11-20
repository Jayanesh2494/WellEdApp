import { Platform } from 'react-native';

// Simple notification service WITHOUT hooks
let Notifications = null;

// Initialize notifications module
const initNotifications = async () => {
  if (Platform.OS === 'web') {
    console.log('⚠️ Notifications not supported on web');
    return false;
  }

  try {
    Notifications = require('expo-notifications').default;
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    return true;
  } catch (error) {
    console.log('⚠️ Notifications module not available:', error.message);
    return false;
  }
};

// Request permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    await initNotifications();
    if (!Notifications) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return false;
    }

    console.log('✅ Notification permission granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule daily reminder
export const scheduleDailyReminder = async () => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await initNotifications();
    if (!Notifications) return;

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule morning reminder (9 AM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Good Morning!',
        body: 'Start your day with wellness! Check your daily tasks.',
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Daily reminders scheduled');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

// Send immediate notification
export const sendLocalNotification = async (title, body) => {
  if (Platform.OS === 'web') {
    console.log(`📢 Notification: ${title} - ${body}`);
    return;
  }

  try {
    await initNotifications();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Notify on task completion
export const notifyTaskComplete = async () => {
  await sendLocalNotification(
    '✅ Task Completed!',
    'Great job! Keep going to complete all tasks today!'
  );
};

// Notify on all tasks complete
export const notifyAllTasksComplete = async (streak) => {
  await sendLocalNotification(
    '🎉 All Tasks Complete!',
    `Amazing! You completed all tasks! Your streak: ${streak} days!`
  );
};
