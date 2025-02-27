import {
  View,
  Text,
  Dimensions,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useShowDetails } from '~/data/query.shows';
import { savedShows$ } from '~/store/store-shows';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useRouter, useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import AddShowButton from '~/components/common/headerButtons/AddShowButton';
import DeleteShowButton from '~/components/common/headerButtons/DeleteShowButton';
import { AnimatePresence, MotiView } from 'moti';
import DetailHeader from './DetailHeader';
import ShowTagContainer from './tags/ShowTagContainer';
import { useHeaderHeight } from '@react-navigation/elements';
import HiddenContainerAnimated from '~/components/common/HiddenContainer/HiddenContainerAnimated';
import WatchProviderContainer from './watchProviders/WatchProviderContainer';
import DetailRecommendations from './DetailRecommendations';
import { HomeIcon } from '~/components/common/Icons';
import CastContainer from './cast/CastContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

type Props = {
  showId: string;
};

const ShowDetailContainer = ({ showId }: Props) => {
  if (!showId) return null;
  const router = useRouter();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  // const headerHeight = useHeaderHeight();
  const { data, isLoading, status, isPlaceholderData, isError } = useShowDetails(parseInt(showId));

  // const { data: omdbData, isLoading: omdbIsLoading } = useOMDBData(data?.imdbId);
  //~ Save Function, make sure to update if data changes.
  const handleSaveShow = useCallback(() => {
    if (!data?.id || !data?.name || !showId) return;
    savedShows$.addShow(data.id.toString());
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
        from={{ translateY: 50 }}
        animate={{ translateY: 0 }}
        transition={{ delay: 300 }}
        className="absolute bottom-[2] right-[20%] z-10">
        <Pressable onPress={() => router.dismissAll()}>
          <HomeIcon size={25} />
        </Pressable>
      </MotiView>
      {/* <MotiView
        key={data?.isStoredLocally ? 'add' : 'delete'}
        from={{ opacity: 0 }}
        animate={{ opacity: data?.isStoredLocally ? 0.15 : 0 }}
        style={[StyleSheet.absoluteFill]}>
        <Image source={data?.backdropURL} style={[StyleSheet.absoluteFill]} />
      </MotiView> */}

      <ScrollView
        className="flex-1 flex-col pt-2"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}>
        {/* Image W/ OMDB Details */}
        <View className={`mx-2 max-h-[300] flex-row`}>
          <View>
            <DetailHeader showData={data} />
          </View>
          <View className="ml-1 flex-1 flex-col overflow-hidden">
            <ScrollView className="mb-1 h-1/3 flex-shrink rounded-lg border-hairline bg-[#ffffff77] p-1">
              <Text className="dark:text-text">{data?.overview}</Text>
              <Text className="dark:text-text">{data?.overview}</Text>
            </ScrollView>
            <View className="h-1/2 rounded-lg border-hairline bg-[#ffffff77] p-1">
              <Text>Avg. Run Time: {data?.avgEpisodeRunTime}</Text>
              <Text>Status: {data?.status}</Text>
              <Text>First Episode: {data?.firstAirDate?.formatted}</Text>
              {data?.lastAirDate?.formatted && (
                <Text>Last Episode: {data?.lastAirDate?.formatted}</Text>
              )}
              <Text>
                Seasons/Episodes - {data?.numberOfSeasons}/{data?.numberOfEpisodes}
              </Text>
            </View>
          </View>
        </View>

        {/* Show Tags - If null passed for showId, this container will not show */}
        <View className="my-2 ">
          <ShowTagContainer showId={data?.tmdbId} />
        </View>

        {/* Show Information */}
        <HiddenContainerAnimated title="Where To Watch" extraHeight={10}>
          <WatchProviderContainer showId={data?.tmdbId} />
        </HiddenContainerAnimated>
        <View className="h-2" />
        {/* Recommendations */}
        <HiddenContainerAnimated title="Recommendations">
          <DetailRecommendations recommendations={data?.recommendations} />
        </HiddenContainerAnimated>
        <View className="h-2" />
        {/* Cast */}
        <HiddenContainerAnimated title="Cast" startOpen>
          <CastContainer showId={data?.tmdbId} cast={data?.credits} />
        </HiddenContainerAnimated>
      </ScrollView>
    </View>
  );
};

export default ShowDetailContainer;
