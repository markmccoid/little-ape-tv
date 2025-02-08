import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { AddIcon, DeleteIcon } from '../common/Icons';
import { savedShows$ } from '~/store/store-shows';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
import SearchItemButtonAnim from './SearchItemButtonAnim';
const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  searchItem: TVSearchResultItem & { isStoredLocally: boolean };
};
const SearchItem = ({ searchItem }: Props) => {
  const { colors } = useCustomTheme();
  return (
    <View className="mb-[25]">
      <Link
        href={{ pathname: '/(authed)/(tabs)/search/[showid]', params: { showId: searchItem.id } }}>
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
      </Link>
      {/* Title and Add/Remove Button */}
      <SearchItemButtonAnim searchItem={searchItem} />
    </View>
  );
};

export default SearchItem;
