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
import { MotiView } from 'moti';

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
      className={`flex-row items-center border-t-hairline px-2 py-2 ${attributes?.watched ? 'bg-[#c5d9c3] dark:bg-[#606b5f]' : ''}`}
      style={{
        height: ITEM_HEIGHT,
        // backgroundColor: attributes?.watched ? '#c5d9c3' : '',
      }}>
      <Pressable
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
            Linking.openURL(`https://www.imdb.com/title/${imdbId}/`);
          });
        }}>
        {/* {isStoredLocally && attributes?.downloaded && (
          <View className="absolute left-[-8] top-[-8] z-10 items-center justify-center rounded-lg  bg-white p-1">
            <SymbolView name="square.and.arrow.down" size={20} tintColor="black" />
          </View>
        )}
        {isStoredLocally && !attributes?.downloaded && (
          <View className="absolute left-[-8] top-[-8] z-10 items-center justify-center rounded-lg  bg-white p-1">
            <SymbolView name="arrow.down" size={20} tintColor="black" />
          </View>
        )} */}
        <View
          // className="overflow-hidden"
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: attributes?.downloaded ? 2 : 2, //StyleSheet.hairlineWidth,
            borderColor: attributes?.downloaded ? colors.buttonDarker : colors.border,
            shadowColor: '#000',
            shadowOffset: {
              width: 1,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}>
          <Image
            source={item.stillURL}
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
              // borderWidth: attributes?.downloaded ? 2 : 2, //StyleSheet.hairlineWidth,
              // borderColor: '#ffffff00',
            }}
            placeholder={require('../../../../../assets/missingPoster.png')}
          />
        </View>
      </Pressable>

      <View className="flex-1">
        <Pressable
          onPress={() => {
            toggleEpisodeDownloaded(showId, item.seasonNumber, item.episodeNumber);
          }}
          disabled={!isStoredLocally}>
          <View className="flex-row items-center">
            <MotiView
              animate={{
                backgroundColor: attributes?.downloaded ? colors.buttonDarker : '#ffffff00',
                borderColor: attributes?.downloaded ? colors.buttonDarkerText : '#ffffff00',
              }}
              exit={{
                backgroundColor: attributes?.downloaded ? colors.buttonDarker : '#ffffff00',
                borderColor: attributes?.downloaded ? colors.buttonDarkerText : '#ffffff00',
              }}
              className={`rounded-b-xl rounded-r-xl ${attributes?.downloaded ? ' border-hairline' : 'border-hairline border-transparent'}`}>
              <Text
                className="mx-2 py-[2] pl-[2] pr-[1] text-lg font-semibold text-text"
                numberOfLines={1}>
                {item.episodeNumber}.
              </Text>
            </MotiView>
            <Text
              className="flex-1 pl-[1] text-lg font-semibold text-text"
              numberOfLines={1}
              lineBreakMode="tail">
              {item.name}
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
        <View
          className="ml-1 mt-1 flex-row items-center justify-between rounded-lg border-hairline bg-[#ffffff99] py-[2] pl-2 pr-2
         dark:bg-[#77777777]">
          <Text style={{ color: colors.text, fontSize: 12 }}>{item?.airDate?.formatted}</Text>
          <Text style={{ color: colors.text, fontSize: 12 }}>{item?.runTime} min</Text>
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
