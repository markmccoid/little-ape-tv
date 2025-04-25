import {
  View,
  Text,
  Dimensions,
  Image as RNImage,
  ScrollView,
  Linking,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react';
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
import { HomeIcon } from '~/components/common/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import TransparentBackground from '~/components/common/TransparentBackground';
import UserRatingContainer from './userRating/UserRatingContainer';
import { UserRatingDetailScreen, MenuItem } from './userRating/UserRatingDetailScreen';
import DetailInfo from './DetailInfo';
import HiddenContainerAnimated from '~/components/common/HiddenContainer/HiddenContainerAnimated';
import CastContainer from './cast/CastContainer';
import WatchProviderContainer from './watchProviders/WatchProviderContainer';
import DetailRecommendations from './DetailRecommendations';
import DetailVideos from './watchProviders/DetailVideos';
import { Ruler } from './userRating/UserRatingRuler';
import UserRatingDetailScreenRuler from './userRating/UserRatingDetailScreenRuler';
// const WatchProviderContainer = lazy(() => import('./watchProviders/WatchProviderContainer'));
// const DetailRecommendations = lazy(() => import('./DetailRecommendations'));
// const DetailVideos = lazy(() => import('./watchProviders/DetailVideos'));
// const CastContainer = lazy(() => import('./cast/CastContainer'));
const { width, height } = Dimensions.get('window');

type Props = {
  showId: string;
};

const ShowDetailContainer = ({ showId }: Props) => {
  if (!showId) return null;
  const router = useRouter();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const [showSetRating, setShowSetRating] = useState(false);
  // const headerHeight = useHeaderHeight();
  const { data, isLoading, status, isPlaceholderData, isError } = useShowDetails(parseInt(showId));

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // we are not checking this anywhere, but by doing this the data that is passed will load without
    // waiting for the timeout and API calls from other children components
    requestAnimationFrame(() => setShouldRender(true));
    // Optionally delay secondary components
    // const timeout = setTimeout(() => setRenderPhase('full'), 75);
    // return () => clearTimeout(timeout);
  }, []);

  //~ Save Function, make sure to update if data changes.
  const handleSaveShow = useCallback(() => {
    if (!data?.id || !data?.name || !showId) return;
    savedShows$.addShow(data.id.toString());
  }, [data?.id]);

  // Set title and left/right header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      animationEnabled: false, // Disable animations for testing
    });
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
  }, [data?.id, data?.isStoredLocally]);

  // if (renderPhase === 'initial') {
  //   return <ActivityIndicator size="large" className="mt-10" />;
  // }
  return (
    <View className={`relative w-full flex-1`}>
      <MotiView
        from={{ translateY: 50 }}
        animate={{ translateY: 0 }}
        transition={{ delay: 300 }}
        className="absolute bottom-[5] right-[5%] z-10 rounded-full border bg-white p-2">
        <Pressable onPress={() => router.dismissAll()}>
          <HomeIcon size={25} />
        </Pressable>
      </MotiView>

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
            </ScrollView>
            <DetailInfo data={data} />
          </View>
        </View>
        {/* RATING/Button BAR */}
        <View className="mx-2 mt-2 flex-1 flex-row items-center rounded-lg border-hairline px-2">
          <TransparentBackground />
          <View className="py-2">
            <Pressable
              onPress={
                () => router.push({ pathname: `/seasonslistmodal`, params: { showid: showId } })
                // router.push({ pathname: `/[showid]/seasonslist`, params: { showid: showId } })
              }
              className="rounded-lg border-hairline bg-buttondarker px-3 py-1">
              <Text className="font-semibold text-buttondarkertext">Seasons</Text>
            </Pressable>
          </View>
          <View className="justify-center] h-full flex-1 items-center">
            {data?.isStoredLocally && (
              //! CHANGE width HERE for change in rulerWidth
              <View className="absolute top-1 z-20 w-[250] flex-row items-center justify-center">
                {/* <Pressable
                  onPress={() => setShowSetRating(true)}
                  // className="rounded-2xl border-hairline bg-yellow-200 px-3.5 py-1"
                  className="py-1/2 z-10 mt-1 h-full border-hairline bg-yellow-200 px-2"
                  style={{
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                    opacity: showSetRating ? 0 : 1,
                  }}>
                  <Text
                    style={[
                      {
                        fontSize: 28,
                        fontWeight: '700',
                        textAlign: 'center',
                        letterSpacing: -2,
                        fontVariant: ['tabular-nums'],
                        width: 40,
                      },
                    ]}>
                    {data.userRating || 0}
                  </Text>
                </Pressable> */}
                {/* <Ruler
                  fadeColor="#eeeeee"
                  startingTick={data.userRating || 0}
                  ticks={12}
                  onChange={(val) => savedShows$.shows[showId].userRating.set(val)}
                /> */}
                <UserRatingDetailScreenRuler
                  fadeColor="#E2BE3E" // "#EEF5E9"
                  startingTick={data.userRating || 0}
                  rulerWidth={250}
                  onChange={(val) => savedShows$.shows[showId].userRating.set(val)}
                />
              </View>
            )}
          </View>
          {/* Buttons */}
          <View className="flex-row justify-end py-2">
            {/* <Pressable
              onPress={
                () => router.push({ pathname: `/seasonslistmodal`, params: { showid: showId } })
                // router.push({ pathname: `/[showid]/seasonslist`, params: { showid: showId } })
              }
              className="rounded-lg border-hairline bg-buttondarker px-3 py-1">
              <Text className="font-semibold text-buttondarkertext">Seasons</Text>
            </Pressable> */}
            <Pressable
              onPress={() => {
                try {
                  const imdbId = data?.imdbId;
                  if (!imdbId) throw new Error('Null imdb id');
                  Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
                    Linking.openURL(`https://www.imdb.com/title/${imdbId}/`);
                    // Linking.openURL('https://apps.apple.com/us/app/imdb-movies-tv-shows/id342792525');
                  });
                } catch (err) {
                  Alert.alert('Error', 'Unable to find Link for IMDB');
                }
              }}
              className="rounded-lg border-hairline bg-imdbYellow px-3 py-1">
              <Text className="font-semibold">IMDB</Text>
            </Pressable>
          </View>
        </View>

        {/* Show Tags - If null passed for showId, this container will not show, however, it causes issues with react, so also not
        showing using && */}

        <View className="my-2 ">{data?.tmdbId && <ShowTagContainer showId={data?.tmdbId} />}</View>

        {/* Show Information */}
        {shouldRender && (
          <HiddenContainerAnimated title="Where To Watch" extraHeight={10}>
            <WatchProviderContainer showId={showId} />
          </HiddenContainerAnimated>
        )}
        <View className="h-2" />
        {/* Recommendations */}
        {shouldRender && (
          <HiddenContainerAnimated title="Recommendations">
            <DetailRecommendations recommendations={data?.recommendations} />
          </HiddenContainerAnimated>
        )}
        <View className="h-2" />
        {/* Videos */}
        {shouldRender && (
          <HiddenContainerAnimated title="Videos" extraHeight={10}>
            <DetailVideos videoData={data?.videos} />
          </HiddenContainerAnimated>
        )}
        <View className="h-2" />
        {/* Cast */}
        {shouldRender && (
          <HiddenContainerAnimated title="Cast" startOpen>
            <CastContainer showId={data?.tmdbId} cast={data?.credits} />
          </HiddenContainerAnimated>
        )}
      </ScrollView>
    </View>
  );
};

export default React.memo(ShowDetailContainer);
