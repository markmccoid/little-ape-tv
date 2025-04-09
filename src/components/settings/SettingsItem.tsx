import { View, Text, Pressable, ViewStyle, Switch, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';

type Props = {
  title: string;
  settingType: 'switch' | 'route';
  route?: string;
  switchCallback?: (val?: boolean) => void;
  switchValue?: boolean;
  LeftSymbol?: () => JSX.Element;
  childStyle?: ViewStyle;
  isFirst?: boolean;
  isLast?: boolean;
};
const SettingsItem = ({
  title,
  settingType,
  route,
  switchCallback,
  switchValue,
  LeftSymbol,
  childStyle = {},
  isFirst = false,
  isLast = false,
}: Props) => {
  const router = useRouter();
  const { colors } = useCustomTheme();

  if (settingType === 'route') {
    if (!route) throw new Error("Route must be provided when settingType is 'route'");
    return (
      <Pressable
        onPress={() => router.push(route)}
        className={`flex-row items-center justify-between border-gray-300 p-1 px-2 active:bg-card `}
        style={{
          backgroundColor: `${colors.card}`,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 10,
          borderTopLeftRadius: isLast ? 0 : 10,
          borderTopRightRadius: isLast ? 0 : 10,
          borderBottomLeftRadius: isFirst ? 0 : 10,
          borderBottomRightRadius: isFirst ? 0 : 10,
          ...childStyle,
        }}>
        <View className="flex-row items-center">
          {LeftSymbol ? <LeftSymbol /> : null}
          <Text className="p-1 text-lg text-text">{title}</Text>
        </View>
        <SymbolView name="chevron.right" tintColor={colors.text} size={20} />
      </Pressable>
    );
  }

  if (!switchCallback)
    throw new Error("switchCallback must be provided when settingType is 'switch'");
  return (
    <View
      className="mx-2 mt-2 flex-row items-center justify-between rounded-lg border-hairline p-1 pl-2 active:bg-card"
      style={{
        backgroundColor: `${colors.card}`,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        borderTopLeftRadius: isLast ? 0 : 10,
        borderTopRightRadius: isLast ? 0 : 10,
        borderBottomLeftRadius: isFirst ? 0 : 10,
        borderBottomRightRadius: isFirst ? 0 : 10,
        ...childStyle,
      }}>
      <Text className="p-1 text-lg text-text">{title}</Text>
      <Switch
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        trackColor={{ false: '#767577', true: '#34C759' }}
        thumbColor={switchValue ? '#FFFFFF' : '#F2F2F2'}
        ios_backgroundColor="#767577"
        onValueChange={(val) => switchCallback(val)}
        value={switchValue}
      />
    </View>
  );
};

export default SettingsItem;
