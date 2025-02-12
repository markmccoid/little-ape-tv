import { View, Text, Dimensions, Pressable, BackHandler } from 'react-native';
import React, { useCallback, useLayoutEffect } from 'react';
import { useMovieDetails } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';
import { Image } from 'expo-image';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import AddShowButton from '~/components/common/headerButtons/AddShowButton';
import DeleteShowButton from '~/components/common/headerButtons/DeleteShowButton';
import { AnimatePresence, MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

type Props = {
  showId: string;
};
const ShowDetailContainer = ({ showId }: Props) => {
  const navigation = useNavigation();
  if (!showId) return null;
  const { data, isLoading, status } = useMovieDetails(parseInt(showId));

  //~ Save Function, make sure to update if data changes.
  const handleSaveShow = useCallback(() => {
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
  }, [data]);

  // Set title and left/right header buttons
  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: data?.name || '...',
      headerLeft: () => <BackHeaderButton />,
      headerRight: () => (
        <View className="relative h-[35] w-[35]">
          <AnimatePresence>
            {data?.isStoredLocally ? (
              <MotiView
                className="absolute bottom-0 left-0 right-0 top-0"
                key="delete"
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                }}>
                <DeleteShowButton showId={showId} />
              </MotiView>
            ) : (
              <MotiView
                className="absolute"
                key="add"
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: 'timing',
                  duration: 300,
                }}>
                <AddShowButton addShow={handleSaveShow} />
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      ),
    };
    navigation.setOptions(options);
  }, [data]);

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
