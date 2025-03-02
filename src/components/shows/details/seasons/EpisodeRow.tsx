import { View, Text, Linking, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { EyeFilledIcon, ViewTVShowIcon } from '~/components/common/Icons';
import { savedShows$ } from '~/store/store-shows';
import {
  buildSeasonEpisodeKey,
  getEpisodeAttributes,
  toggleEpisodeWatched,
} from '~/store/functions-shows';
import { Episode } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';

// Define fixed heights for performance
const ITEM_HEIGHT = 120;

type Props = {
  showId: string;
  isStoredLocally: boolean;
  item: Episode;
};

const EpisodeRow = ({ showId, isStoredLocally, item }: Props) => {
  // const atributes = getEpisodeAttributes(showId, item.seasonNumber, item.episodeNumber);
  const attributes = use$(
    savedShows$.showAttributes[showId][buildSeasonEpisodeKey(item.seasonNumber, item.episodeNumber)]
  );
  // console.log('EpisodeRow', attributes);
  return (
    <Pressable
      style={{ height: ITEM_HEIGHT }}
      className="border-b-hairline bg-white"
      onPress={async () => {
        const { imdbId } = await getEpisodeIMDBURL(
          parseInt(showId),
          item.seasonNumber,
          item.episodeNumber
        );

        if (imdbId === null) {
          return null;
        }
        Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
          Linking.openURL('https://apps.apple.com/us/app/imdb-movies-tv-shows/id342792525');
        });
      }}>
      <View className="mt-2 flex-row items-center px-2">
        <Image
          source={item.stillURL}
          // style={styles.image}
          style={{
            width: 100,
            height: 100,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '#ccc',
            borderRadius: 12,
          }}
          placeholder={require('../../../../../assets/missingPoster.png')}
        />
        {/* <Text>
              {item.episodeNumber}-{item.name}
            </Text>
            <Image source={{ uri: item.stillURL }} style={styles.image} /> */}
        <View className="mx-2  flex-1">
          <Text className="text-lg font-semibold text-text" numberOfLines={1}>
            {item.episodeNumber}. {item.name}
          </Text>
          <Text
            style={styles.overview}
            className="text-text"
            numberOfLines={3}
            ellipsizeMode="tail">
            {item.overview}
          </Text>
          <View className="mt-2 flex-row justify-between">
            {isStoredLocally && (
              <Pressable
                className="flex-row items-center justify-center"
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
                  <ViewTVShowIcon size={22} />
                )}
              </Pressable>
            )}
            <Text style={styles.footerText}>{item?.airDate?.formatted}</Text>
            <Text style={styles.footerText}>{item?.runTime} min</Text>
          </View>
          <View></View>
        </View>
      </View>
    </Pressable>
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
export default EpisodeRow;
