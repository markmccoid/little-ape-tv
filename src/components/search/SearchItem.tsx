import { View, Text, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import React from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';
import SearchItemButtonAnim from './SearchItemButtonAnim';
const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

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
          <Image
            source={searchItem.posterURL}
            contentFit="cover"
            style={{ width: IMG_WIDTH, height: IMG_HEIGHT }}
          />
        </View>
      </TouchableOpacity>
      {/* </Link> */}
      {/* Title and Add/Remove Button */}
      <Text>{searchItem.isStoredLocally ? 'STORED' : 'NOT'}</Text>
      <SearchItemButtonAnim searchItem={searchItem} />
    </View>
  );
};

export default React.memo(SearchItem);
