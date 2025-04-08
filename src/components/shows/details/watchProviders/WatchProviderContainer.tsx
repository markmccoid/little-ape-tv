import { View, Text, Image, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import React, { useDeferredValue, useState } from 'react';
import { useWatchProviders, WatchProviderOnly } from '~/data/query.shows';
import WatchProviderSection from './WatchProviderSection';
import { ProviderInfo } from '@markmccoid/tmdb_api';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  showId: string | undefined;
};

interface WatchProviderSection {
  section: 'stream' | 'rent' | 'buy';
  sectionTitle: string;
  order: number;
  sectionProviders: ProviderInfo[];
}

const MDWatchProviders = ({ showId }: Props) => {
  if (!showId) return null;

  const { data: initData, isLoading } = useWatchProviders(showId);
  const data = useDeferredValue(initData);
  const watchProviders = data?.watchProviders;
  const justWatchLink = data?.justWatchLink;

  const scrollOffset = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.x;
  });
  // - - - START Height Template - - - - -
  // If we are still loading here, we need to return a sample of the height we will need
  if (isLoading || !watchProviders)
    return (
      <WatchProviderSection
        item={{
          type: 'justWatchLink',
          title: 'JustWatch',
          providers: [
            {
              provider: 'justWatch',
              logoURL: 'https://www.justwatch.com/blog/images/icon.png',
              providerId: justWatchLink,
              displayPriority: 1000,
            },
          ],
        }}
        index={0}
        scrollOffset={scrollOffset}
        watchProviders={[]}
      />
    );
  // - - - END Height Template - - - - -
  const watchProviderCount = watchProviders.reduce(
    (fin, el) => fin + el?.providers?.length || 0,
    0
  );

  if (watchProviderCount === 0) {
    return (
      <View className="flex-row items-center justify-center">
        <Text>Not available to Stream, Rent or Buy</Text>
      </View>
    );
  }

  // Remove any groups that do NOT have any providers
  const finalWatchProviders = watchProviders.filter(
    (el) => el?.providers && el?.providers.length > 0
  );
  //! ------------
  //! Cramming this into the watch providers so that we get a "justWatch"
  //! icon at the end of the list that can be clicked on.
  //! NOTE: Custom code in WatchProviderSection.tsx to handle these fields
  //! ------------
  const justWatchProvider: WatchProviderOnly = {
    type: 'justWatchLink',
    title: 'JustWatch',
    providers: [
      {
        provider: 'justWatch',
        logoURL: 'https://www.justwatch.com/blog/images/icon.png',
        providerId: justWatchLink,
        displayPriority: 1000,
      },
    ],
  };

  return (
    <View>
      <Animated.FlatList
        horizontal
        data={[...finalWatchProviders, justWatchProvider]}
        keyExtractor={(item) => item.type}
        renderItem={({ item, index }) => (
          // <ListItem item={item} index={index} scrollOffset={scrollOffset} />
          <WatchProviderSection
            item={item}
            index={index}
            scrollOffset={scrollOffset}
            watchProviders={finalWatchProviders}
          />
        )}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      />
      {/* <TouchableOpacity onPress={async () => WebBrowser.openBrowserAsync(justWatchLink)}>
        <Text>JustWatch Site</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default React.memo(MDWatchProviders);
