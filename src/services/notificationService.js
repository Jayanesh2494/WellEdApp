import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async () => {
  try {
    if (Platform.OS === 'web') {
      console.log('⚠️ Push notifications not supported on web');
      return false;
    }

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
  try {
    if (Platform.OS === 'web') return;

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

    // Schedule afternoon reminder (2 PM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 Wellness Check!',
        body: 'How are your daily tasks going? Keep up the great work!',
        sound: true,
      },
      trigger: {
        hour: 14,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule evening reminder (6 PM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Complete Your Day!',
        body: 'Finish your remaining wellness tasks before the day ends!',
        sound: true,
      },
      trigger: {
        hour: 18,
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
  try {
    if (Platform.OS === 'web') {
      console.log(`Notification: ${title} - ${body}`);
      return;
    }

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
