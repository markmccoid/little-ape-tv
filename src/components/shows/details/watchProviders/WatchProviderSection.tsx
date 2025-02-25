import { View, Image, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { WatchProviderOnly } from '~/data/query.shows';
import * as Linking from 'expo-linking';

type Props = {
  item: WatchProviderOnly;
  index: number;
  scrollOffset: SharedValue<number>;
  watchProviders: WatchProviderOnly[];
};
const PROVIDER_ICON_SIZE = 50;
const ICON_MARGIN = 5;
const GROUP_MARGIN = 10;

const WatchProviderSection = ({ item, index, scrollOffset, watchProviders }: Props) => {
  const [viewSize, setViewSize] = useState(0);

  const numOfProviders = item.providers?.length === 1 ? 2 : item.providers?.length || 2;
  const prevNumOfProviders = watchProviders
    .filter((el, ind) => ind < index)
    .reduce((fin, type) => fin + (type.providers?.length || 0), 0);

  const currStart =
    // - spacing for provider icons
    prevNumOfProviders * PROVIDER_ICON_SIZE +
    // - margin between each icon
    prevNumOfProviders * ICON_MARGIN * 2 +
    // - margin between each group
    index * GROUP_MARGIN;
  const currSize =
    numOfProviders * PROVIDER_ICON_SIZE + numOfProviders * ICON_MARGIN * 2 + index * GROUP_MARGIN;
  const currEnd = currStart + currSize;

  //~~ Animated Style
  const animatedTitleStyle = useAnimatedStyle(() => {
    // return {}
    let pos = 0;
    if (scrollOffset.value > currStart && scrollOffset.value < currEnd) {
      pos = scrollOffset.value - currStart;
    }

    // console.log("ITEM", item.title, pos, item.providers.length, currStart, currEnd, offset);
    // Use interpolation to calculate opacity
    const opacity = interpolate(
      scrollOffset.value,
      [currEnd - (viewSize + 30), currEnd - viewSize],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        {
          translateX: pos,
        },
      ],
    };
  });

  return (
    <View className="mt-1 " style={{ marginRight: GROUP_MARGIN }}>
      <View style={[{}]} className="flex-row rounded-md border-hairline bg-green-500 pl-[5]">
        <Animated.Text
          style={[{ fontSize: 16, fontWeight: 'bold', paddingRight: 5 }, animatedTitleStyle]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setViewSize(width);
          }}>
          {item.title}
        </Animated.Text>
      </View>
      {item?.type === 'justWatchLink' ? (
        <TouchableOpacity
          onPress={async () => {
            Linking.openURL(item.providers[0].providerId).catch((err) =>
              console.log('Error opening WatchProvider', err)
            );
          }}
          style={{ paddingTop: 5 }}>
          <View key={1} style={{ marginHorizontal: ICON_MARGIN }}>
            <Image
              source={require('../../../../../assets/images/justWatch.png')}
              style={{
                width: PROVIDER_ICON_SIZE,
                height: PROVIDER_ICON_SIZE,
                borderRadius: 8,
              }}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <View className="flex-row" style={{ paddingTop: 5 }}>
          {item?.providers &&
            item.providers.length > 0 &&
            item.providers?.map((el) => {
              return (
                <View key={el.providerId} style={{ marginHorizontal: ICON_MARGIN }}>
                  {el?.logoURL && (
                    <Image
                      source={{ uri: el.logoURL }}
                      style={{
                        width: PROVIDER_ICON_SIZE,
                        height: PROVIDER_ICON_SIZE,
                        borderRadius: 8,
                      }}
                    />
                  )}
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
};

export default WatchProviderSection;
