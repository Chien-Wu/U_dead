/**
 * Push Notification Service
 * Handles local notification scheduling and remote push registration
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";
import {
  EXPO_PROJECT_ID,
  NOTIFICATION_12H_WARNING,
  NOTIFICATION_1H_WARNING,
} from "@env";

// Random notification titles pool (10 variations)
const NOTIFICATION_TITLES = [
  "Still breathing?",
  "You there?",
  "Knock knock...",
  "We're getting worried",
  "Time's ticking",
  "Everything okay?",
  "Check-in time!",
  "Don't leave us hanging",
  "You alive or what?",
  "Prove you're not dead",
];

/**
 * Get random title from pool
 */
const getRandomTitle = (): string => {
  return NOTIFICATION_TITLES[
    Math.floor(Math.random() * NOTIFICATION_TITLES.length)
  ];
};

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

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

/**
 * Register device for remote push notifications
 * Sends push token to backend
 */
export const registerForPushNotifications = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Notification permissions not granted");
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });

    const platform = Platform.OS === "ios" ? "ios" : "android";
    await api.registerDevice(token.data, platform);

    console.log("Push token registered:", token.data);
  } catch (error) {
    console.error("Failed to register push token:", error);
  }
};

/**
 * Schedule local notifications after check-in
 * Creates 3 notifications: 12h, 1h, and 0h before deadline
 */
export const scheduleCheckInReminders = async (
  nextDeadline: string,
): Promise<void> => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Fetch contacts to include in notification body
    const contacts = await api.getContacts();
    const contactNames = contacts.map((c) => c.name);

    // Format contact list for notification
    let contactList = "";
    if (contactNames.length === 0) {
      contactList = "your emergency contacts";
    } else if (contactNames.length === 1) {
      contactList = contactNames[0];
    } else if (contactNames.length === 2) {
      contactList = `${contactNames[0]} and ${contactNames[1]}`;
    } else {
      contactList = `${contactNames[0]}, ${contactNames[1]}, and ${contactNames.length - 2} more`;
    }

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
      const hoursRemaining = Math.floor(
        (deadlineDate.getTime() - twelveHoursBefore.getTime()) / 3600000,
      );
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getRandomTitle(),
          body: `Check in within ${hoursRemaining} hours, or we'll notify ${contactList} about your situation.`,
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
      const hoursRemaining = Math.floor(
        (deadlineDate.getTime() - oneHourBefore.getTime()) / 3600000,
      );
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getRandomTitle(),
          body: `Check in within ${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""}, or we'll notify ${contactList} about your situation.`,
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
          title: getRandomTitle(),
          body: `Time's up! We're notifying ${contactList} now.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: atDeadline,
        },
      });
    }

    console.log("Scheduled reminders for:", nextDeadline);
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Test notification - fires in 2 seconds
 */
export const testNotification = async (): Promise<void> => {
  try {
    console.log("🔔 Checking notification permissions...");
    const hasPermission = await requestNotificationPermissions();
    console.log("🔔 Permission status:", hasPermission ? "GRANTED" : "DENIED");

    if (!hasPermission) {
      console.error("❌ Notification permission denied");
      throw new Error("Notification permission denied");
    }

    console.log("🔔 Scheduling test notification...");
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test",
        body: "Notifications work!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log("✅ Test notification scheduled with ID:", id);
  } catch (error) {
    console.error("❌ Failed to schedule test notification:", error);
    throw error;
  }
};
