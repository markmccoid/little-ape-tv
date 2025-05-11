import { View, Text, TextInput, Alert, StyleSheet, Pressable } from 'react-native';
import React, { useReducer, useState } from 'react';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import ShadowBackground from '~/components/common/ShadowBackground';
import InfoPopup from '~/components/common/InfoPopup';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import WheelPicker from '@quidone/react-native-wheel-picker';

const currYear = parseInt(dayjs().format('YYYY'));
const numYears = currYear - (currYear - 50) + 1;
const data = [...Array(numYears).keys()].map((index) => ({
  value: (index + (currYear - 50)).toString(),
  label: (index + (currYear - 50)).toString(),
}));

const FirstAirDate = ({ invalidateQuery }: { invalidateQuery: () => void }) => {
  const [showPicker, toggleShowPicker] = useReducer((prev) => !prev, false);
  const { firstAirDateYear } = use$(settings$.initialQuery);

  return (
    <View className="flex-row items-center justify-between gap-2 rounded-md border-hairline bg-slate-200 p-2">
      <ShadowBackground />
      <View className="flex-row items-center gap-3">
        <Text className="font-Roboto-400">First Air Date Year</Text>
        <InfoPopup
          title="First Air Date"
          infoText={`The initial search page will only show TV shows where the first episode aired in this year or later.`}
        />
      </View>
      <View className="flex-col items-center justify-center">
        <Pressable
          onPress={toggleShowPicker}
          className="mb-1 rounded-md border-hairline bg-button px-2 py-1">
          <Text className="text-base text-buttontext">
            {showPicker ? 'Select' : firstAirDateYear}
          </Text>
        </Pressable>
        {showPicker && (
          <WheelPicker
            style={{
              backgroundColor: '#ffffff44',
              paddingHorizontal: 10,
              opacity: 1,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 10,
            }}
            data={data}
            value={firstAirDateYear || currYear.toString()}
            onValueChanged={({ item }) => {
              settings$.initialQuery.firstAirDateYear.set(item.value);
              invalidateQuery();
            }}
          />
        )}
      </View>
    </View>
  );
};

export default FirstAirDate;
