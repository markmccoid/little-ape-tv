import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { NotificationRecord, settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { use$ } from '@legendapp/state/react';
import { orderBy, sortBy } from 'lodash';
import { ScrollView } from 'moti';
import { savedShows$ } from '~/store/store-shows';
import { useRouter } from 'expo-router';

type Filter = {
  offset: 'one' | 'more' | undefined;
  name: string;
  hasSent: boolean;
};
const NotificationList = () => {
  const router = useRouter();
  const notificationHistory = use$(settings$.notificationHistory);
  const shows = use$(savedShows$.shows);
  const [filter, setFilter] = useState<{ name: string; hasSent: boolean | undefined }>({
    name: '',
    hasSent: undefined,
  });

  const notificationData = useMemo(() => {
    let filteredData = orderBy(
      Object.keys(notificationHistory).map((key) => notificationHistory[key]),
      ['dateChecked'],
      ['desc']
    );
    if (filter.hasSent !== undefined) {
      filteredData = filteredData.filter((el) =>
        filter.hasSent ? el.dateSent !== undefined : el.dateSent === undefined
      );
    }
    if (filter.name !== '') {
      filteredData = filteredData.filter((el) =>
        el.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }
    return filteredData;
  }, [filter]);
  // const [notificationData, setNotificationData] = useState<NotificationRecord[]>(
  //   orderBy(
  //     Object.keys(notificationHistory).map((key) => notificationHistory[key]),
  //     ['dateChecked'],
  //     ['desc']
  //   )
  // );
  const backgroundRuns = settings$.backgroundRunLog.peek() || [];

  useEffect(() => {});
  return (
    <View className="mt-2 flex-1">
      <View className="ml-2 flex-row items-center justify-start self-start rounded-t-lg border border-b-0 bg-card p-2">
        <Text className="text-xl font-bold text-text">Notification History</Text>
      </View>
      <View className=" flex-1 border-hairline bg-background">
        <View style={{ height: 100 }}>
          <ScrollView className="mb-2 border-hairline bg-white">
            <View className="mx-4 flex-row flex-wrap justify-between">
              {backgroundRuns.map((el, index) => {
                return (
                  <View
                    key={el?.dateTimeEpoch || index}
                    className="mb-2 border p-2"
                    style={{ backgroundColor: el.type === 'notify' ? 'lime' : 'purple' }}>
                    <Text
                      className="font-semibold"
                      style={{ color: el.type === 'notify' ? 'black' : 'white' }}>
                      {dayjs.unix(el?.dateTimeEpoch || 0).format('MM-DD-YY HH:mm:ss')}-(
                      {el?.numShows || 0})
                    </Text>
                    {el.type === 'notify-ERROR' && (
                      <Text className="font-semibold">ERROR - {el?.detail || 'Unknown Error'}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View className="flex-1 border-t">
          <View className="flex-row gap-2 p-2">
            <Pressable
              onPress={() =>
                setFilter((prev) => ({
                  ...prev,
                  hasSent:
                    prev.hasSent === undefined ? true : prev.hasSent === true ? false : undefined,
                }))
              }
              className="flex-row items-center border-hairline bg-white p-1">
              <Text>
                {filter.hasSent
                  ? 'Showing Sent'
                  : filter.hasSent === undefined
                    ? 'No Sent Filter'
                    : 'Show Sent'}
              </Text>
            </Pressable>
            <TextInput
              className="w-[200] border-hairline bg-white p-2"
              value={filter.name}
              placeholder="Filter by Name"
              onChangeText={(el) => setFilter((prev) => ({ ...prev, name: el }))}
            />
          </View>
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
                    <Text className="text-lg font-semibold">Last Notify Date: </Text>
                    <Text className="text-lg">
                      {item?.dateLastNotify
                        ? dayjs.unix(item.dateLastNotify).format('MM-DD-YYYY HH:mm:ss')
                        : '-----'}
                    </Text>
                  </View>
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
