import { View, Text, Linking, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { EyeFilledIcon, TelevisionIcon, ViewTVShowIcon } from '~/components/common/Icons';
import { savedShows$ } from '~/store/store-shows';
import {
  buildSeasonEpisodeKey,
  toggleEpisodeDownloaded,
  toggleEpisodeWatched,
} from '~/store/functions-showAttributes';
import { Episode } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

// Define fixed heights for performance
const ITEM_HEIGHT = 120;

type Props = {
  showId: string;
  isStoredLocally: boolean;
  item: Episode;
};

const EpisodeRow = ({ showId, isStoredLocally, item }: Props) => {
  const { colors } = useCustomTheme();
  const attributes = use$(
    savedShows$.showAttributes[showId][buildSeasonEpisodeKey(item.seasonNumber, item.episodeNumber)]
  );
  // console.log('EpisodeRow', attributes);
  return (
    // <Pressable
    //   style={{ height: ITEM_HEIGHT }}
    //   className="border-b-hairline bg-white"
    //   onPress={async () => {
    //     const { imdbId } = await getEpisodeIMDBURL(
    //       parseInt(showId),
    //       item.seasonNumber,
    //       item.episodeNumber
    //     );

    //     if (imdbId === null) {
    //       return null;
    //     }
    //     Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
    //       Linking.openURL('https://apps.apple.com/us/app/imdb-movies-tv-shows/id342792525');
    //     });
    //   }}>
    <View
      className="flex-row items-center  px-2 py-2"
      style={{
        height: ITEM_HEIGHT,
        backgroundColor: attributes?.watched ? '#c5d9c3' : '',
      }}>
      <Pressable
        onPress={() => {
          toggleEpisodeDownloaded(showId, item.seasonNumber, item.episodeNumber);
        }}
        disabled={!isStoredLocally}>
        {isStoredLocally && attributes?.downloaded && (
          <View className="absolute left-[-8] top-[-8] z-10 items-center justify-center rounded-lg  bg-white p-1">
            <SymbolView name="square.and.arrow.down" size={20} tintColor="black" />
          </View>
        )}
        {isStoredLocally && !attributes?.downloaded && (
          <View className="absolute left-[-8] top-[-8] z-10 items-center justify-center rounded-lg  bg-white p-1">
            <SymbolView name="arrow.down" size={20} tintColor="black" />
          </View>
        )}
        <Image
          source={item.stillURL}
          // style={styles.image}
          style={{
            width: 100,
            height: 100,
            borderWidth: attributes?.downloaded ? 2 : StyleSheet.hairlineWidth,
            borderColor: attributes?.downloaded ? 'red' : '#ccc',
            borderRadius: 12,
          }}
          placeholder={require('../../../../../assets/missingPoster.png')}
        />
      </Pressable>
      {/* <Text>
              {item.episodeNumber}-{item.name}
            </Text>
            <Image source={{ uri: item.stillURL }} style={styles.image} /> */}
      <View className="flex-1">
        <Pressable
          onPress={() => {
            toggleEpisodeDownloaded(showId, item.seasonNumber, item.episodeNumber);
          }}
          disabled={!isStoredLocally}>
          <View>
            <Text className="mx-2 text-lg font-semibold text-text" numberOfLines={1}>
              {item.episodeNumber}. {item.name}
            </Text>
          </View>
        </Pressable>
        <View className="mx-2">
          <Text
            style={styles.overview}
            className="text-text"
            numberOfLines={3}
            ellipsizeMode="tail">
            {item.overview}
          </Text>
        </View>
        <View className="mx-2 mt-1 flex-row items-center justify-between">
          <Text style={styles.footerText}>{item?.airDate?.formatted}</Text>
          <Text style={styles.footerText}>{item?.runTime} min</Text>
          {/* {isStoredLocally && ( */}
          <Pressable
            className={`flex-row items-center justify-center ${isStoredLocally ? 'opacity-100' : 'opacity-0'}`}
            onPress={() => {
              toggleEpisodeWatched(showId, item.seasonNumber, item.episodeNumber);
            }}>
            {!!attributes?.watched ? (
              <View className="flex-row items-center justify-center">
                <ViewTVShowIcon size={25} color={'green'} />
                <View className="absolute top-[7]">
                  <EyeFilledIcon size={15} color={'green'} />
                </View>
              </View>
            ) : (
              <ViewTVShowIcon size={25} color={colors.text} />
            )}
          </Pressable>
          {/* )} */}
        </View>
      </View>
    </View>
    // </Pressable>
  );
};

const styles = StyleSheet.create({
  overview: {
    fontSize: 14,
    marginTop: 1,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});
export default React.memo(EpisodeRow);
