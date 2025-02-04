import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { useMovieDetails } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';
import { Image } from 'expo-image';
import { times } from 'lodash';

const { width, height } = Dimensions.get('window');

type Props = {
  showId: string;
};
const ShowDetailContainer = ({ showId }: Props) => {
  if (!showId) return null;
  const { data, isLoading, status } = useMovieDetails(parseInt(showId));

  const handleSaveShow = () => {
    if (!data?.id || !data?.name || !showId) return;

    savedShows$.addShow({
      tmdbId: data.id.toString(),
      name: data.name,
      posterURL: data.posterURL,
      avgEpisodeRunTime: data.avgEpisodeRunTime,
      backdropURL: data.backdropURL,
      genres: data.genres,
      imdbId: data.imdbId,
      tvdbId: data.tvdbId,
    });
  };

  return (
    <View>
      <Text>ShowDetailContainer for {showId}</Text>
      <Image source={data?.posterURL} style={{ width: width / 2.3, height: (width / 2.3) * 1.5 }} />
      <Text>{data?.avgEpisodeRunTime}</Text>
      <Text className="bg-red-500 text-lg">{data?.isStoredLocally ? 'LOCAL' : ''}</Text>
      <Pressable onPress={handleSaveShow}>
        <Text>ADD</Text>
      </Pressable>
      <Pressable
        onPress={() => savedShows$.removeShow(showId)}
        className="border bg-yellow-300 p-1">
        <Text>DELETE</Text>
      </Pressable>
    </View>
  );
};

export default ShowDetailContainer;
