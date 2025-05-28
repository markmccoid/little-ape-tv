import { View, Text, ViewStyle, Pressable, StyleSheet, Switch, TextInput } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
import ThemeSelector, { ThemeOption } from './ThemeSelector';

type RouteProps = {
  title: string;
  route?: string;
  LeftSymbol?: () => JSX.Element;
  childStyle?: ViewStyle;
  isFirst?: boolean;
  isLast?: boolean;
};

type SwitchProps = {
  title: string;
  switchCallback: (val?: boolean) => void;
  switchValue: boolean;
  LeftSymbol?: () => JSX.Element;
  childStyle?: ViewStyle;
};

type SelectProps = {
  title: string;
  selectCallback: (val: number) => void;
  selectValue: number;
  LeftSymbol?: () => JSX.Element;
  childStyle?: ViewStyle;
};

export const SettingsItemRoute = ({
  title,
  route,
  LeftSymbol,
  childStyle = {},
  isFirst = false,
  isLast = false,
}: RouteProps) => {
  const router = useRouter();
  const { colors } = useCustomTheme();

  return (
    <Pressable
      onPress={() => router.push(route)}
      className={`flex-row items-center justify-between border-gray-300 p-1 px-2 active:bg-card `}
      style={{
        backgroundColor: `${colors.card}`,
        borderWidth: StyleSheet.hairlineWidth,
        // borderRadius: 10,
        // borderTopLeftRadius: isLast ? 0 : 10,
        // borderTopRightRadius: isLast ? 0 : 10,
        // borderBottomLeftRadius: isFirst ? 0 : 10,
        // borderBottomRightRadius: isFirst ? 0 : 10,
        ...childStyle,
      }}>
      <View className="flex-row items-center">
        {LeftSymbol ? <LeftSymbol /> : null}
        <Text className="p-1 text-lg text-text">{title}</Text>
      </View>
      <SymbolView name="chevron.right" tintColor={colors.text} size={20} />
    </Pressable>
  );
};

export const SettingsItemSwitch = ({
  title,
  switchCallback,
  switchValue,
  LeftSymbol,
  childStyle = {},
}: SwitchProps) => {
  const { colors } = useCustomTheme();

  return (
    <View
      className="flex-row items-center justify-between rounded-lg border-gray-300 p-1 pl-2 active:bg-card"
      style={{
        backgroundColor: `${colors.card}`,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        // borderTopLeftRadius: isLast ? 0 : 10,
        // borderTopRightRadius: isLast ? 0 : 10,
        // borderBottomLeftRadius: isFirst ? 0 : 10,
        // borderBottomRightRadius: isFirst ? 0 : 10,
        ...childStyle,
      }}>
      <View className="flex-row items-center">
        {LeftSymbol ? <LeftSymbol /> : null}
        <Text className="p-1 text-lg text-text">{title}</Text>
      </View>
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

export const SettingsNumberSelect = ({
  title,
  selectCallback,
  selectValue,
  LeftSymbol,
  childStyle = {},
}: SelectProps) => {
  const { colors } = useCustomTheme();
  const [localValue, setLocalValue] = React.useState(selectValue.toString());
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(selectValue.toString());
  }, [selectValue]);

  const handleChange = (val: string) => {
    const parsedValue = parseInt(val);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    const parsedValue = parseInt(localValue);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      selectCallback(parsedValue);
    }
    setIsActive(false);
  };

  const handlePress = () => {
    setIsActive(true);
  };

  const [selection, setSelection] = React.useState({ start: 0, end: localValue.length });

  const handleFocus = () => {
    // Select all text when input is focused
    setSelection({ start: 0, end: localValue.length });
  };

  return (
    <View
      className="flex-row items-center justify-between rounded-lg border-gray-300 p-1 pl-2 active:bg-card"
      style={{
        backgroundColor: `${colors.card}`,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        ...childStyle,
      }}>
      <View className="flex-row items-center">
        {LeftSymbol ? <LeftSymbol /> : null}
        <Text className="p-1 text-lg text-text">{title}</Text>
      </View>
      <Pressable onPress={handlePress} className="mr-2">
        {isActive ? (
          <TextInput
            className="flex-row justify-end border-b-hairline border-primary text-right"
            style={{ fontSize: 20, width: 50 }}
            value={localValue}
            onChangeText={handleChange}
            keyboardType="numeric"
            onBlur={handleBlur}
            onSubmitEditing={handleBlur}
            onFocus={handleFocus}
            selection={selection}
            onSelectionChange={({ nativeEvent: { selection } }) => setSelection(selection)}
            selectTextOnFocus={true}
            autoFocus={true}
          />
        ) : (
          <Text className="text-right" style={{ fontSize: 20, width: 50 }}>
            {localValue}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

// Multi Select
type CustomProps = {
  title: string;
  selectCallback: (val?: ThemeOption) => void;
  selectValue: ThemeOption;
  LeftSymbol?: () => JSX.Element;
  childStyle?: ViewStyle;
};
export const SettingsItemThemeSelect = ({
  title,
  selectCallback,
  selectValue,
  LeftSymbol,
  childStyle = {},
}: CustomProps) => {
  const { colors } = useCustomTheme();

  return (
    <View
      className="flex-row items-center justify-between rounded-lg border-gray-300 p-1 pl-2 active:bg-card"
      style={{
        backgroundColor: `${colors.card}`,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        // borderTopLeftRadius: isLast ? 0 : 10,
        // borderTopRightRadius: isLast ? 0 : 10,
        // borderBottomLeftRadius: isFirst ? 0 : 10,
        // borderBottomRightRadius: isFirst ? 0 : 10,
        ...childStyle,
      }}>
      <View className="flex-row items-center">
        {LeftSymbol ? <LeftSymbol /> : null}
        <Text className="p-1 text-lg text-text">{title}</Text>
      </View>
      <ThemeSelector selectedValue={selectValue} onValueChange={selectCallback} />
    </View>
  );
};
