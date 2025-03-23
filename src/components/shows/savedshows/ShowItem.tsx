import { View, Text, Dimensions, Pressable, ScrollView } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { SavedShow } from '~/store/functions-shows';
import { Link, router } from 'expo-router';
import { savedShows$ } from '~/store/store-shows';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  FadeOutLeft,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import SearchItemButtonAnim from '~/components/search/SearchItemButtonAnim';
import ShowItemBottom from './ShowItemBottom';
import ScrollerMain from './ScrollerMain';
import ScrollerSecond from './ScrollerSecond';
import { MotiView } from 'moti';
import SetFavoriteButton from '../details/tags/SetFavoriteButton';
import DeleteShowButton from './DeleteShowButton';

const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  show: SavedShow;
};

const ShowItem = ({ show }: Props) => {
  const scrollX = useSharedValue(0);

  const [currIndex, setCurrIndex] = useState(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  //~ Types for cardData
  interface Props {
    show: any; // Adjust this based on what 'show' actually is
    imageWidth: number;
    imageHeight: number;
    index: number;
    scrollX: any; // Adjust this based on what 'scrollX' actually is
  }
  type CardDataItem = {
    id: string;
    component: React.ComponentType<Props>; // General type for React components
  };
  const cardData: CardDataItem[] = [
    {
      id: 'main',
      component: ScrollerMain,
    },
    {
      id: 'second',
      component: ScrollerSecond,
    },
  ];

  //~ Handle the scrolling --------------
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      // scrollX.value = e.contentOffset.x;
      scrollX.value = e.contentOffset.x / IMG_WIDTH;
    },
    onEndDrag: (e) => {
      const currentOffset = e.contentOffset.x;
      const index = Math.round(currentOffset / IMG_WIDTH);
      runOnJS(setCurrIndex)(index);
    },
    onMomentumEnd: (e) => {
      // Calculate index after scroll has completely stopped
      const currentOffset = e.contentOffset.x;
      const index = Math.round(currentOffset / IMG_WIDTH);
      runOnJS(setCurrIndex)(index);
    },
  });

  const getItemLayout = (_: any, index: number) => {
    return {
      length: IMG_WIDTH + 1,
      offset: (IMG_WIDTH + 1) * index, // Remove the -1 here as it was causing incorrect offsets
      index,
    };
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      // position: 'absolute',
      // left: -10,
      // top: -10,
      opacity: interpolate(scrollX.value, [0, 0.7, 0.9, 1], [0, 0.2, 0.4, 1], Extrapolation.CLAMP),
    };
  });

  // const renderItem = useCallback(
  //   ({ item, index }: { item: CardDataItem; index: number }) => {
  //     const Comp = React.memo(item.component);
  //     // Only render if it's the current index or adjacent
  //     const shouldRender = Math.abs(index - currIndex) <= 1;

  //     return (
  //       <View
  //         style={{
  //           width: IMG_WIDTH + 1,
  //         }}>
  //         {shouldRender ? (
  //           <Comp
  //             show={show}
  //             imageWidth={IMG_WIDTH}
  //             imageHeight={IMG_HEIGHT}
  //             index={index}
  //             scrollX={scrollX}
  //           />
  //         ) : (
  //           // Placeholder to maintain layout
  //           <View style={{ width: IMG_WIDTH, height: IMG_HEIGHT }} />
  //         )}
  //       </View>
  //     );
  //   },
  //   [currIndex]  );
  const renderItem = useCallback(({ item, index }: { item: CardDataItem; index: number }) => {
    const Comp = React.memo(item.component);
    return (
      <View
        style={{
          width: IMG_WIDTH + 1,
        }}>
        <Comp
          show={show}
          imageWidth={IMG_WIDTH}
          imageHeight={IMG_HEIGHT}
          index={index}
          scrollX={scrollX}
        />
      </View>
    );
  }, []);

  return (
    <Animated.View className="relative mb-[25]" exiting={FadeOutLeft} entering={FadeIn}>
      <Animated.FlatList
        onScroll={handleScroll}
        data={cardData}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        decelerationRate="fast"
        snapToInterval={IMG_WIDTH + 1}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        style={{
          width: IMG_WIDTH + 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: 0,
        }}
      />

      {currIndex === 1 && (
        <>
          <Animated.View style={[buttonStyle, { position: 'absolute', left: 0, top: -10 }]}>
            <SetFavoriteButton showId={show.tmdbId} isFavorited={!!show.favorite} />
          </Animated.View>
          <Animated.View style={[buttonStyle, { position: 'absolute', right: 0, top: -10 }]}>
            <DeleteShowButton showId={show.tmdbId} />
          </Animated.View>
        </>
      )}

      {/* Future Home of dynamic Info screen.  Maybe button (circle) in corner of image when long press
          reveals more info screen */}
      {/* <ShowItemBottom show={show} /> */}
    </Animated.View>
  );
};

export default React.memo(ShowItem);
