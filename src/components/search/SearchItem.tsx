import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  searchItem: TVSearchResultItem;
};
const SearchItem = ({ searchItem }: Props) => {
  // console.log('searchItem', searchItem);
  // if (!searchItem) return null;
  return (
    <Link
      href={{ pathname: '/(authed)/(tabs)/search/[showid]', params: { showId: searchItem.id } }}
      style={{ width: IMG_WIDTH }}>
      <Image
        source={searchItem.posterURL}
        contentFit="cover"
        style={{ width: IMG_WIDTH, height: IMG_HEIGHT }}
      />
      <Text key={searchItem.id} numberOfLines={1} lineBreakMode="tail" className="flex-1">
        {searchItem.name}
      </Text>
    </Link>
  );
};

export default SearchItem;
