import { View, Text, FlatList } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { use$ } from '@legendapp/state/react';

const NotificationList = () => {
  const notificationHistory = use$(settings$.notificationHistory);
  const notificationData = Object.keys(notificationHistory).map((key) => notificationHistory[key]);
  return (
    <View className="mt-2">
      <View className="ml-2 flex-row items-center justify-start self-start rounded-t-lg border border-b-0 bg-card p-2">
        <Text className="text-xl font-bold text-text">Notification History</Text>
      </View>
      <FlatList
        data={notificationData}
        keyExtractor={(item) => item.Id.toString()}
        className="border-t-hairline"
        renderItem={({ item }) => {
          return (
            <View key={item.Id} className="flex-col border-b-hairline bg-white p-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text>{item.Id}</Text>
              </View>
              <View className="flex-row items-center justify-start">
                <Text className="text-lg font-semibold">Sent: </Text>
                <Text className="text-lg">
                  {dayjs.unix(item.dateSent).format('MM-DD-YY HH:mm:ss')}
                </Text>
              </View>
            </View>
          );
        }}
      />
      {/* {notificationHistory &&
        Object.keys(notificationHistory).length > 0 &&
        Object.keys(notificationHistory).map((key) => {
          const notification = notificationHistory[key];
          return (
            <View key={key} className="flex-row items-center justify-between p-2">
              <Text>{notification.name}</Text>
              <Text>{notification.Id}</Text>
              <Text>{dayjs(notification.dateSent * 1000).format('HH:mm:ss')}</Text>
            </View>
          );
        })} */}
    </View>
  );
};

export default NotificationList;
