import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { AddIcon, DeleteIcon } from '../common/Icons';
import { savedShows$ } from '~/store/store-shows';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

const prepareAddShow = (searchitem) => ({
  tmdbId: searchitem.id.toString(),
  name: searchitem.name,
  posterURL: searchitem.posterURL,
  avgEpisodeRunTime: searchitem.avgEpisodeRunTime,
  backdropURL: searchitem.backdropURL,
  genres: searchitem.genres,
  imdbId: searchitem.imdbId,
  tvdbId: searchitem.tvdbId,
});
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
      <View
        className="z-10 mx-1 my-[-15] flex-row items-center justify-center rounded-lg border p-1"
        style={{ backgroundColor: searchItem.isStoredLocally ? colors.includeGreen : 'white' }}>
        <Text key={searchItem.id} numberOfLines={1} lineBreakMode="tail" className="flex-1">
          {searchItem.name}
        </Text>
        {searchItem.isStoredLocally ? (
          <Pressable onPress={() => savedShows$.removeShow(searchItem.id.toString())}>
            {/* <DeleteIcon size={20} /> */}
            <SymbolView name="minus.circle.fill" tintColor={colors.deleteRed} />
          </Pressable>
        ) : (
          <Pressable onPress={() => savedShows$.addShow(prepareAddShow(searchItem))}>
            {/* <AddIcon size={20} /> */}
            <SymbolView name="plus.circle.fill" tintColor={colors.includeGreen} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default SearchItem;
