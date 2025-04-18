import { View, Text, ViewStyle } from 'react-native';
import React from 'react';
import { SettingsItemRoute, SettingsItemSwitch, SettingsItemThemeSelect } from './SettingsItems';

type SettingsGroupProps = {
  title?: string;
  style?: ViewStyle;
  children: React.ReactNode;
};

const SettingsGroup = ({ title, children, style }: SettingsGroupProps) => {
  return (
    <View className="mx-2" style={style}>
      {title && <Text className="mb-1 ml-2 text-2xl">{title}</Text>}
      <View className="overflow-hidden rounded-lg border-hairline border-gray-500">{children}</View>
    </View>
  );
};

SettingsGroup.RouteItem = SettingsItemRoute;
SettingsGroup.SwitchItem = SettingsItemSwitch;
SettingsGroup.ThemeSelect = SettingsItemThemeSelect;
export default SettingsGroup;
