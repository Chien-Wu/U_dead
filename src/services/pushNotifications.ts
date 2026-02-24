/**
 * Push Notification Service
 * Handles local notification scheduling and remote push registration
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';
import { EXPO_PROJECT_ID, NOTIFICATION_12H_WARNING, NOTIFICATION_1H_WARNING } from '@env';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * Returns true if granted, false otherwise
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Register device for remote push notifications
 * Sends push token to backend
 */
export const registerForPushNotifications = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await api.registerDevice(token.data, platform);

    console.log('Push token registered:', token.data);
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
};

/**
 * Schedule local notifications after check-in
 * Creates 3 notifications: 12h, 1h, and 0h before deadline
 */
export const scheduleCheckInReminders = async (nextDeadline: string): Promise<void> => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const deadlineDate = new Date(nextDeadline);
    const now = new Date();

    // Calculate notification times
    const twelveHoursMs = parseInt(NOTIFICATION_12H_WARNING, 10) || 43200000;
    const oneHourMs = parseInt(NOTIFICATION_1H_WARNING, 10) || 3600000;
    const twelveHoursBefore = new Date(deadlineDate.getTime() - twelveHoursMs);
    const oneHourBefore = new Date(deadlineDate.getTime() - oneHourMs);
    const atDeadline = deadlineDate;

    // Schedule 12-hour warning (if in future)
    if (twelveHoursBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'U still alive?',
          body: '12h left to prove it',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: twelveHoursBefore,
        },
      });
    }

    // Schedule 1-hour warning (if in future)
    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '\u{1F6A8} Last call',
          body: "Don't ghost your loved ones.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: oneHourBefore,
        },
      });
    }

    // Schedule deadline notification (if in future)
    if (atDeadline > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'We told them you\'re dead',
          body: 'Hope you\'re just sleeping.',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: atDeadline,
        },
      });
    }

    console.log('Scheduled reminders for:', nextDeadline);
  } catch (error) {
    console.error('Failed to schedule notifications:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
