import { View, Text } from 'react-native';
import React from 'react';
import { CastType } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import ShowImage from '~/components/common/ShowImage';

type Props = {
  castInfo: CastType;
};
const CastItem = ({ castInfo }: Props) => {
  return (
    <Animated.View
      entering={FadeIn}
      className="my-2 flex-col items-center overflow-hidden rounded-xl border-hairline"
      style={{ width: 126 }}>
      <View className="bg-white">
        {/* <Image source={castInfo?.profileURL} style={{ width: 125, height: 125 * 1.5 }} /> */}
        <ShowImage
          posterURL={castInfo?.profileURL}
          title={castInfo.name}
          imageWidth={125}
          imageHeight={125 * 1.5}
          imageStyle={{ width: 125, height: 125 * 1.5 }}
        />
        <Text className="px-1 text-center text-base" lineBreakMode="tail" numberOfLines={1}>
          {castInfo.name}
        </Text>
        <Text
          className="px-1 text-center text-base text-green-800"
          lineBreakMode="tail"
          numberOfLines={1}>
          {castInfo.characterName}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CastItem;
