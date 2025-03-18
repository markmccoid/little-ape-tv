import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import React, { useEffect } from 'react';
// import useSettingsStore from "@/store/store.settings";
import { SymbolView } from 'expo-symbols';

import { MotiView } from 'moti';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCustomTheme } from '~/utils/customColorTheme';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';

type Props = {
  isVisible: boolean;
  handleSetVisible: (value: boolean) => void;
  searchY: SharedValue<number>;
};
const ShowNameSearch = ({ isVisible, handleSetVisible, searchY }: Props) => {
  const { ignoreOtherFilters, showName: titleSearchValue } = use$(filterCriteria$.nameFilter);
  // const titleSearchValue = useSettingsStore((state) => state.titleSearchValue);
  // const titleSearchScope = useSettingsStore((state) => state.titleSearchScope);
  // const setTitleSearchValue = useSettingsStore((state) => state.actions.setTitleSearchValue);
  const setTitleSearchValue = (value: string) => filterCriteria$.nameFilter.showName.set(value);
  const setTitleSearchScope = (value: boolean) =>
    filterCriteria$.nameFilter.ignoreOtherFilters.set(value);
  const { colors } = useCustomTheme();
  const inputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => setTitleSearchValue(''), 300);
    } else {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  const animStyle = useAnimatedStyle(() => {
    return {
      opacity: searchY.value === -40 ? withTiming(0, { duration: 300 }) : 1,
    };
  });
  return (
    <Animated.View
      className="absolute w-full flex-row items-center"
      // style={{ opacity: isVistssible ? 1 : 0 }}
      style={[animStyle]}>
      <Pressable onPress={() => handleSetVisible(false)} className="ml-2 mr-1 rounded-lg">
        <SymbolView name="arrowtriangle.up.square" tintColor={colors.primary} size={25} />
      </Pressable>
      <TextInput
        ref={inputRef}
        placeholder={ignoreOtherFilters ? 'Search all TV Shows' : 'Search filtered TV Shows'}
        value={titleSearchValue}
        editable={isVisible}
        onChangeText={(text) => setTitleSearchValue(text)}
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'gray',
          backgroundColor: colors.card,
          padding: 10,
          marginRight: 10,
          // marginTop: 5,
          borderRadius: 10,
          color: 'black',
          flexGrow: 1,
        }}
        autoCorrect={false}
      />

      {titleSearchValue !== '' && (
        <Pressable className="absolute right-[100]" onPress={() => setTitleSearchValue('')}>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: titleSearchValue ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 500 }}>
            <SymbolView name="x.circle.fill" type="palette" colors={['white', 'gray']} size={17} />
          </MotiView>
        </Pressable>
      )}

      <View className="relative flex-row p-[10]">
        <Pressable onPress={() => setTitleSearchScope(true)} className="mr-[10] rounded-full">
          <MotiView
            animate={{
              backgroundColor: ignoreOtherFilters ? colors.button : `${colors.primary}aa`,
              opacity: ignoreOtherFilters ? 1 : 0.4,
            }}
            transition={{
              type: 'timing',
              duration: 500, // Adjust duration as needed
            }}
            className="rounded-full">
            <SymbolView
              size={25}
              name="magnifyingglass.circle"
              tintColor={ignoreOtherFilters ? 'black' : `white`}
            />
          </MotiView>
        </Pressable>
        <Pressable onPress={() => setTitleSearchScope(false)} className=" rounded-full">
          <MotiView
            animate={{
              backgroundColor: !ignoreOtherFilters ? colors.button : `${colors.primary}aa`,
              opacity: !ignoreOtherFilters ? 1 : 0.4,
            }}
            transition={{
              type: 'timing',
              duration: 500, // Adjust duration as needed
            }}
            className="rounded-full">
            <SymbolView
              size={25}
              name="line.3.horizontal.decrease.circle"
              tintColor={!ignoreOtherFilters ? 'black' : 'white'}
            />
          </MotiView>
        </Pressable>
        <MotiView
          from={{ translateX: ignoreOtherFilters ? 45 : 10 }}
          animate={{ translateX: ignoreOtherFilters ? 10 : 45 }}
          transition={{ type: 'timing', duration: 500 }}
          className="absolute bottom-[5] left-0 h-1 w-[25] bg-primary"
        />
      </View>
    </Animated.View>
  );
};

export default ShowNameSearch;
