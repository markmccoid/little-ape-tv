import { View, Text, FlatList, Pressable } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { use$ } from '@legendapp/state/react';
import { orderBy, sortBy } from 'lodash';
import { ScrollView } from 'moti';
import { savedShows$ } from '~/store/store-shows';
import { useRouter } from 'expo-router';

const NotificationList = () => {
  const router = useRouter();
  const notificationHistory = use$(settings$.notificationHistory);
  const shows = use$(savedShows$.shows);
  const notificationData = orderBy(
    Object.keys(notificationHistory).map((key) => notificationHistory[key]),
    ['dateChecked'],
    ['desc']
  );
  const backgroundRuns = settings$.notificationBackgroundRun.peek();

  return (
    <View className="mt-2 flex-1">
      <View className="ml-2 flex-row items-center justify-start self-start rounded-t-lg border border-b-0 bg-card p-2">
        <Text className="text-xl font-bold text-text">Notification History</Text>
      </View>
      <View className=" flex-1 border-hairline bg-background">
        <View style={{ height: 100 }}>
          <ScrollView className="mb-2 border-hairline bg-white">
            <View className="mx-4 flex-row flex-wrap justify-between">
              {backgroundRuns.map((el) => {
                return (
                  <View key={el.dateTimeEpoch} className="mb-2 border bg-lime-200 p-2">
                    <Text className="text-buttontext">
                      {dayjs.unix(el.dateTimeEpoch).format('MM-DD-YY HH:mm:ss')}-({el.numShows})
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View className="flex-1 border-t">
          <FlatList
            data={notificationData}
            keyExtractor={(item) => item.Id.toString()}
            className="mb-10"
            renderItem={({ item }) => {
              return (
                <View key={item.Id} className="flex-col border-b-hairline bg-white p-2">
                  <Pressable
                    onPress={() => {
                      router.replace({ pathname: `/[showid]`, params: { showid: item.Id } });
                    }}
                    className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">{item.name}</Text>
                    <Text>Offset-{shows[item.Id]?.nextNotifyOffset}</Text>
                    <Text className="rounded-lg border bg-slate-200 px-3 py-1 text-blue-800">
                      {item.Id}
                    </Text>
                  </Pressable>
                  <View className="flex-row items-center justify-start">
                    <Text className="text-lg font-semibold">Message: </Text>
                    <Text className="text-lg">{item.text}</Text>
                  </View>
                  <View className="flex-row items-center justify-start">
                    <Text className="text-lg font-semibold">Checked: </Text>
                    <Text className="text-lg">
                      {item?.dateChecked &&
                        dayjs.unix(item.dateChecked).format('MM-DD-YY HH:mm:ss')}
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
