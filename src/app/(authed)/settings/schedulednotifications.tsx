import { View, Text, Pressable } from 'react-native';
import React from 'react';
import * as Notifications from 'expo-notifications';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';

const schedulednotifications = () => {
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [time, setTime] = React.useState(new Date());

  console.log('Scheduled Notifications', dayjs(time).format('HH:mm:ss'));
  return (
    <View>
      <View>
        <Pressable
          onPress={() => setShowTimePicker(true)}
          className="flex-row items-center justify-between p-2">
          <Text>Time To Send Notifications</Text>
          <Text>{dayjs(time).format('HH:mm:ss')}</Text>
        </Pressable>
        <DatePicker
          modal
          open={showTimePicker}
          date={time}
          mode="time"
          onConfirm={(time) => {
            setShowTimePicker(false);
            setTime(time);
          }}
          onCancel={() => {
            setShowTimePicker(false);
          }}
        />
      </View>
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
