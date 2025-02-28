import { View, Text } from 'react-native';
import React, { useMemo } from 'react';
import { ShowDetailsData, useShowDetails, useShowSeasonData } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';
import EpisodeList from './EpisodeList';

type Props = {
  showData: ShowDetailsData;
};
const SeasonsContainer = () => {
  const { showid } = useLocalSearchParams();
  const { data: showData } = useShowDetails(parseInt(showid as string));
  // console.log('SeasonsContainer', showid, showData.tmdbId);
  const seasons = useMemo(() => {
    return showData.seasons?.map((el) => el.seasonNumber) || [];
  }, [showid, showData.tmdbId]);
  // console.log('SEASONS', seasons);
  const { data, isLoading } = useShowSeasonData(showid as string, seasons);
  // console.log('SeasonEpisode Data', data[0]);
  if (!isLoading) {
    // console.log('Data', data[0].episodes);
    // console.log(
    //   'Data',
    //   data?.map((el) => el.episodes).flatMap((el) => el)
    // );
  }
  return (
    <View className="mb-20 ">
      {!isLoading && (
        <EpisodeList seasons={data} onEpisodePress={() => console.log('Episode Pressed')} />
      )}
      {/* {data?.map((el) => {
        return (
          <View>
            <Text>{el.name}</Text>
            {el.episodes.map((episode) => {
              return (
                <View className="flex-row justify-between">
                  <Text>{episode.episodeNumber}</Text>
                  <Text>{episode.name}</Text>
                  <Text>{episode.runtime}</Text>
                </View>
              );
            })}
          </View>
        );
      })} */}
    </View>
  );
};

export default SeasonsContainer;
