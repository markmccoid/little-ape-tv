import { View, Text, Pressable } from 'react-native';
import React from 'react';
import * as Notifications from 'expo-notifications';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import { settings$ } from '~/store/store-settings';
import { ScrollView } from 'moti';
import SetNotificationTime from '~/components/settings/notifications/SetNotificationTime';
import NotificationList from '~/components/settings/notifications/NotificationList';

const schedulednotifications = () => {
  return (
    <View className="flex-1">
      <SetNotificationTime />
      <NotificationList />
    </View>
  );
};

export default schedulednotifications;

// Get all scheduled notifications
async function getAllScheduledNotifications() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', scheduledNotifications);
  return scheduledNotifications;
}

// Cancel a specific notification by its identifier
async function cancelNotification(notificationIdentifier: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationIdentifier);
}

// Cancel all scheduled notifications
async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
