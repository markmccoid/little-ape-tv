import { View, Text, Pressable } from 'react-native';
import React from 'react';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import { settings$ } from '~/store/store-settings';

const SetNotificationTime = () => {
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [time, setTime] = React.useState(new Date());

  return (
    <View className="mt-2 border-hairline bg-white p-2">
      <Pressable
        onPress={() => setShowTimePicker(true)}
        className="flex-row items-center justify-between p-2">
        <Text className="font-semibold">Set Time To Send Notifications</Text>
        <Text>{dayjs(time).format('hh:mm A')}</Text>
      </Pressable>
      <DatePicker
        modal
        open={showTimePicker}
        date={time}
        mode="time"
        onConfirm={(time) => {
          setShowTimePicker(false);
          setTime(time);
          // extract hour and minute from the selected time
          // and set them in the settings
          const hour = dayjs(time).hour();
          const minute = dayjs(time).minute();
          settings$.notificationTime.set({
            hour: hour,
            minute: minute,
          });
        }}
        onCancel={() => {
          setShowTimePicker(false);
        }}
      />
    </View>
  );
};

export default SetNotificationTime;
