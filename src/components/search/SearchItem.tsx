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
import { getNoImageFound2 } from '~/utils/utils';
import ShowImage from '../common/ShowImage';

const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

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
        className="rounded-lg border-green-600">
        <View
          style={{
            width: imageWidth,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          <ShowImage
            title={searchItem.name}
            posterURL={posterURL || searchItem.posterURL}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            resizeMode="contain"
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
