import { View, Text, FlatList } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { use$ } from '@legendapp/state/react';
import { sortBy } from 'lodash';

const NotificationList = () => {
  const notificationHistory = use$(settings$.notificationHistory);
  const notificationData = sortBy(
    Object.keys(notificationHistory).map((key) => notificationHistory[key]),
    ['dateSent']
  );
  return (
    <View className="mt-2 flex-1">
      <View className="ml-2 flex-row items-center justify-start self-start rounded-t-lg border border-b-0 bg-card p-2">
        <Text className="text-xl font-bold text-text">Notification History</Text>
      </View>
      <View className=" flex-1 border-hairline bg-white">
        <FlatList
          data={notificationData}
          keyExtractor={(item) => item.Id.toString()}
          className="mb-10"
          renderItem={({ item }) => {
            return (
              <View key={item.Id} className="flex-col border-b-hairline bg-white p-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold">{item.name}</Text>
                  <Text>{item.Id}</Text>
                </View>
                <View className="flex-row items-center justify-start">
                  <Text className="text-lg font-semibold">Message: </Text>
                  <Text className="text-lg">{item.text}</Text>
                </View>
                <View className="flex-row items-center justify-start">
                  <Text className="text-lg font-semibold">Checked: </Text>
                  <Text className="text-lg">
                    {item?.dateChecked && dayjs.unix(item.dateChecked).format('MM-DD-YY HH:mm:ss')}
                  </Text>
                </View>
                <View className="flex-row items-center justify-start">
                  <Text className="text-lg font-semibold">Sent: </Text>
                  <Text className="text-lg">
                    {item?.dateSent && dayjs.unix(item.dateSent).format('MM-DD-YY HH:mm:ss')}
                  </Text>
                </View>
                <View className="flex-row items-center justify-start">
                  {item?.otherInfo && <Text className="text-lg">{item?.otherInfo}</Text>}
                </View>
              </View>
            );
          }}
        />
      </View>
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
