import { View, Text } from 'react-native';
import React from 'react';

type SettingsGroupProps = {
  title: string;
  children: React.ReactNode;
};

const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  return (
    <View className="mx-2 ">
      <Text className="mb-1 ml-2 text-2xl">{title}</Text>
      <View className="overflow-hidden rounded-lg border-hairline border-gray-500">{children}</View>
    </View>
  );
};

export default SettingsGroup;
