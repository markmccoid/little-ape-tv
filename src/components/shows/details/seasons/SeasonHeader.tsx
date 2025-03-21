import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { SeasonsSection } from './SeasonEpisodeList';
import {
  removeSeasonFromDownloaded,
  removeSeasonFromWatched,
  setSeasonToDownloaded,
  setSeasonToWatched,
} from '~/store/functions-showAttributes';
import {
  EyeNotWatchedIcon,
  EyeWatchedIcon,
  TelevisionIcon,
  TelevisionOffIcon,
} from '~/components/common/Icons';
import Ticker from './EpisodeWatchAnimation';

type Props = {
  showId: string;
  section: SeasonsSection;
  isStoredLocally: boolean;
  headerHeight: number;
};
const SeasonHeader = ({ showId, section, isStoredLocally, headerHeight }: Props) => {
  const allWatched = section.counts.allWatched;
  const allDownloaded = section.counts.allDownloaded;

  return (
    <View
      className={`z-50 flex-col border-b-hairline bg-button px-3 py-2  ${allWatched ? 'bg-buttondarker' : ''}`}
      style={{ height: headerHeight }}>
      {/* First Line */}
      <View className="flex-row justify-center">
        <Text
          className={`text-xl font-bold ${allWatched ? 'text-buttondarkertext' : 'text-buttontext'}`}>
          {section.title}
        </Text>
      </View>
      {/* Second Line */}
      {isStoredLocally && (
        <View className="flex-1 flex-row justify-start">
          {/* DOWNLOADED Buttons */}
          <View className="flex-start flex-row">
            <Pressable
              onPress={() =>
                setSeasonToDownloaded(showId, section.seasonNumber, section.numEpisodes)
              }
              className={`mr-2 rounded border-hairline bg-gray-300 px-[3] py-[1] ${allDownloaded ? 'opacity-50' : ''}`}
              disabled={allDownloaded}>
              <TelevisionIcon size={25} />
            </Pressable>
            <Pressable
              onPress={() =>
                removeSeasonFromDownloaded(showId, section.seasonNumber, section.numEpisodes)
              }
              className={`mr-2 rounded border-hairline bg-red-200 px-[3] py-[1] ${section.counts.downloaded === 0 ? 'opacity-50' : 0}`}>
              <TelevisionOffIcon size={25} />
            </Pressable>
          </View>
          {/* Viewed Show Count */}
          {/* <View className="flex-1 flex-row"> */}
          <View className="h-full flex-1 flex-row items-center justify-center">
            <Ticker value={section.counts.watched} fontSize={16} />
            <Text
              style={{
                fontSize: 16,
                lineHeight: 16 * 1.1,
                fontWeight: '600',
                height: 16,
                fontVariant: ['tabular-nums'],
              }}>
              {' '}
              of {section.numEpisodes}
            </Text>
          </View>
          {/* WATCHED Buttons */}
          <View className="flex-row justify-end ">
            <Pressable
              onPress={() => setSeasonToWatched(showId, section.seasonNumber, section.numEpisodes)}
              className={`mr-2 rounded border-hairline bg-gray-300 px-[3] py-[1] ${allWatched ? 'opacity-50' : ''}`}
              disabled={allWatched}>
              <EyeWatchedIcon size={25} />
            </Pressable>
            <Pressable
              onPress={() =>
                removeSeasonFromWatched(showId, section.seasonNumber, section.numEpisodes)
              }
              className={`mr-2 rounded border-hairline bg-red-200 px-[3] py-[1] ${section.counts.watched === 0 ? 'opacity-50' : 0}`}>
              <EyeNotWatchedIcon size={25} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default React.memo(SeasonHeader);
