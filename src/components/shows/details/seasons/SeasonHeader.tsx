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

type Props = {
  showId: string;
  section: SeasonsSection;
  headerHeight: number;
};
const SeasonHeader = ({ showId, section, headerHeight }: Props) => {
  const allWatched = section.counts.allWatched;
  const allDownloaded = section.counts.allDownloaded;

  return (
    <View
      className={` flex-col border-b-hairline bg-[#6a9c4fee] px-3 py-1 ${allWatched ? 'bg-green-200' : ''}`}
      style={{ height: headerHeight }}>
      {/* First Line */}
      <View className="flex-row justify-between">
        <Text className="text-xl font-bold">{section.title}</Text>
        <Text>
          {section.counts.watched}/{section.numEpisodes} watched
        </Text>
      </View>
      {/* Second Line */}
      <View className="flex-row justify-start">
        <Pressable
          onPress={() => setSeasonToDownloaded(showId, section.seasonNumber, section.numEpisodes)}
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
        <View className="flex-1 flex-row justify-end ">
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
    </View>
  );
};

export default SeasonHeader;
