import { View, Text, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import SearchItemButtonAnim from './SearchItemButtonAnim';
import useImageSize from '~/utils/useImageSize';
import { search$ } from '~/store/store-search';
import { use$ } from '@legendapp/state/react';
import { settings$ } from '~/store/store-settings';
import { savedShows$ } from '~/store/store-shows';

const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;
const missingPosterURI = require('../../../assets/missingPoster.png');

// type SearchItemData = {
//   id: string;
//   name: string;
//   posterURL: string;
//   isStoredLocally: boolean
// }
type Props = {
  searchItem: TVSearchResultItem & { isStoredLocally: boolean };
  numColumns: 2 | 3;
};
const SearchItem = ({ searchItem, numColumns }: Props) => {
  const router = useRouter();
  const posterURL = use$(savedShows$.shows[searchItem.id].posterURL);

  const { imageHeight, imageWidth } = useImageSize(numColumns);
  return (
    <View className="mb-[25]">
      {/* <Link href={{ pathname: `/[showid]`, params: { showid: searchItem.id }, key={searchItem.id} }}> */}
      <Pressable
        onPress={() => router.push({ pathname: `/[showid]`, params: { showid: searchItem.id } })}
        className="rounded-lg border-green-600 active:border-hairline">
        <View
          style={{
            width: imageWidth,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          {!searchItem?.posterURL && (
            <View className="absolute top-0 z-10 w-full px-[4] py-[2] ">
              <Text
                className="flex-1 text-center font-Asul-Bold text-xl font-medium"
                numberOfLines={2}>
                {searchItem.name}
              </Text>
            </View>
          )}
          <Image
            source={posterURL || searchItem.posterURL || missingPosterURI}
            contentFit="cover"
            style={{ width: imageWidth, height: imageHeight }}
          />
        </View>
      </Pressable>
      {/* </Link> */}
      {/* Title and Add/Remove Button */}
      <SearchItemButtonAnim searchItem={searchItem} />
    </View>
  );
};

export default React.memo(SearchItem);
