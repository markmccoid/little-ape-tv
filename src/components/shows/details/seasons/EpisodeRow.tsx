import { View, Text, Linking, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import {
  EyeFilledIcon,
  HeartIcon,
  IMDBIcon,
  TelevisionIcon,
  ViewTVShowIcon,
} from '~/components/common/Icons';
import { savedShows$ } from '~/store/store-shows';
import {
  buildSeasonEpisodeKey,
  toggleEpisodeDownloaded,
  toggleEpisodeFavorited,
  toggleEpisodeWatched,
} from '~/store/functions-showAttributes';
import { Episode } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { MotiView } from 'moti';
import { settings$ } from '~/store/store-settings';

// Define fixed heights for performance
const ITEM_HEIGHT = 125;

type Props = {
  showId: string;
  isStoredLocally: boolean;
  item: Episode;
};
//Open the IMDB app to the season/episode
const linkToImdb = async (showId: string, seasonNumber: number, episodeNumber: number) => {
  const { imdbId } = await getEpisodeIMDBURL(parseInt(showId), seasonNumber, episodeNumber);
  if (imdbId === null) {
    return null;
  }
  Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
    Linking.openURL(`https://www.imdb.com/title/${imdbId}/`);
  });
};

//~~ Component EpisodeRow
const EpisodeRow = ({ showId, isStoredLocally, item }: Props) => {
  const { colors } = useCustomTheme();
  const attributes = use$(
    savedShows$.showAttributes[showId][buildSeasonEpisodeKey(item.seasonNumber, item.episodeNumber)]
  );
  const showImage = use$(settings$.showImageInEpisode);

  // console.log('EpisodeRow', attributes);
  return (
    <View
      className={`flex-row items-center border-t px-2 py-2 ${attributes?.watched ? 'bg-[#c5d9c3] dark:bg-[#606b5f]' : ''}`}
      style={{
        height: ITEM_HEIGHT,
        // backgroundColor: attributes?.watched ? '#c5d9c3' : '',
      }}>
      {!showImage && (
        <Pressable
          onPress={async () => linkToImdb(showId, item.seasonNumber, item.episodeNumber)}
          className="absolute right-0 top-0 z-30">
          <View className="rounded-bl-lg border-b-hairline border-l-hairline bg-yellow-200 py-1 pl-[4] pr-[2]">
            {/* <IMDBIcon size={25}  /> */}
            <Text>IMDb</Text>
          </View>
        </Pressable>
      )}
      {showImage && (
        <Pressable onPress={async () => linkToImdb(showId, item.seasonNumber, item.episodeNumber)}>
          <View
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
      )}
      <View className="flex-1">
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
            <Pressable
              onPress={() => {
                toggleEpisodeDownloaded(showId, item.seasonNumber, item.episodeNumber);
              }}
              disabled={!isStoredLocally}>
              <Text
                className="mx-2 py-[2] pl-[2] pr-[1] text-lg font-semibold text-text"
                numberOfLines={1}>
                {item.episodeNumber}.
              </Text>
            </Pressable>
          </MotiView>
          <Text
            className="flex-1 pl-[1] text-lg font-semibold text-text"
            numberOfLines={1}
            lineBreakMode="tail">
            {item.name}
          </Text>
        </View>
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
          {/* FAVORITED? Only show if stored localally This is done with opacity so spacoing stays the same*/}
          <Pressable
            className={`flex-row items-center justify-center ${isStoredLocally ? 'opacity-100' : 'opacity-0'}`}
            onPress={() => {
              toggleEpisodeFavorited(showId, item.seasonNumber, item.episodeNumber);
            }}>
            {!!attributes?.favorited ? (
              <View className="flex-row items-center justify-center">
                <SymbolView name="heart.fill" size={25} tintColor={'red'} />
              </View>
            ) : (
              <SymbolView name="heart" size={25} tintColor={colors.text} />
            )}
          </Pressable>

          <Text style={{ color: colors.text, fontSize: 12 }}>{item?.airDate?.formatted}</Text>
          <Text style={{ color: colors.text, fontSize: 12 }}>{item?.runTime} min</Text>
          {/* WATCHED? Only show if stored localally This is done with opacity so spacoing stays the same*/}
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
