import { View, Text, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';
import SearchItemButtonAnim from './SearchItemButtonAnim';
const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;
const missingPosterURI = require('../../../assets/missingPoster.png');
type Props = {
  searchItem: TVSearchResultItem & { isStoredLocally: boolean };
};
const SearchItem = ({ searchItem }: Props) => {
  const router = useRouter();

  return (
    <View className="mb-[25]">
      {/* <Link href={{ pathname: `/[showid]`, params: { showid: searchItem.id }, key={searchItem.id} }}> */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: `/[showid]`, params: { showid: searchItem.id } })}>
        <View
          style={{
            width: IMG_WIDTH,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          {!searchItem?.posterURL && (
            <View className="absolute top-0 z-10 w-full px-[4] py-[2] ">
              <Text
                className="font-Asul-Bold flex-1 text-center text-xl font-medium"
                numberOfLines={2}>
                {searchItem.name}
              </Text>
            </View>
          )}
          <Image
            source={searchItem.posterURL || missingPosterURI}
            contentFit="cover"
            style={{ width: IMG_WIDTH, height: IMG_HEIGHT }}
          />
        </View>
      </TouchableOpacity>
      {/* </Link> */}
      {/* Title and Add/Remove Button */}
      <SearchItemButtonAnim searchItem={searchItem} />
    </View>
  );
};

export default React.memo(SearchItem);
