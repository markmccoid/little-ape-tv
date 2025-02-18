import { View, Text, Dimensions, Image as RNImage, ScrollView, StyleSheet } from 'react-native';
import React, { useCallback, useLayoutEffect } from 'react';
import { useOMDBData, useShowDetails } from '~/data/query.shows';
import { use$ } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';
import { Image } from 'expo-image';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import AddShowButton from '~/components/common/headerButtons/AddShowButton';
import DeleteShowButton from '~/components/common/headerButtons/DeleteShowButton';
import { AnimatePresence, MotiView } from 'moti';
import DetailHeader from './DetailHeader';
import ShowTagContainer from './tags/ShowTagContainer';
import { useHeaderHeight } from '@react-navigation/elements';
const { width, height } = Dimensions.get('window');

type Props = {
  showId: string;
};
const ShowDetailContainer = ({ showId }: Props) => {
  if (!showId) return null;
  const navigation = useNavigation();
  // const headerHeight = useHeaderHeight();
  const { data, isLoading, status } = useShowDetails(parseInt(showId));
  // const { data: omdbData, isLoading: omdbIsLoading } = useOMDBData(data?.imdbId);
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
    <View className={`relative w-full flex-1`}>
      <MotiView
        key={data?.isStoredLocally ? 'add' : 'delete'}
        from={{ opacity: 0 }}
        animate={{ opacity: data?.isStoredLocally ? 0.15 : 0 }}
        style={[StyleSheet.absoluteFill]}>
        <Image source={data?.backdropURL} style={[StyleSheet.absoluteFill]} />
      </MotiView>

      <ScrollView className="flex-1 flex-col pt-2 ">
        {/* Image W/ OMDB Details */}
        <View className="mx-2 flex-row">
          <View>
            <DetailHeader showData={data} />
          </View>
          <View className="ml-2 flex-1">
            <Text className="">{data?.overview}</Text>
          </View>
        </View>

        {/* Show Tags - If null passed for showId, this container will not show */}
        <View className="my-2 ">
          <ShowTagContainer showId={data?.tmdbId} />
        </View>
        <View className="">
          <Text className="text-xl">Next Section</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShowDetailContainer;
