import { View, Text, StyleSheet, Dimensions, Pressable, FlatList } from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { usePersonDetails } from '~/data/query.shows';
import { reTagPersonShows } from '~/store/functions-shows';
import { savedShows$ } from '~/store/store-shows';
import PersonShowItem from './PersonShowItem';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import PersonProfile from './PersonProfile';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import PersonMovieItem from './PersonMovieItem';
import useImageSize from '~/utils/useImageSize';
const { width: screenWidth, height } = Dimensions.get('window');

type Props = {
  personId: string;
  currentShowId: string;
};

// Define constants for header height animation
const HEADER_MAX_HEIGHT = 195; // Initial height of the profile section
const HEADER_MIN_HEIGHT = 0; // Height it shrinks down to
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Create animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const PersonContainer = ({ personId, currentShowId }: Props) => {
  const { colors } = useCustomTheme();
  const { data, isLoading } = usePersonDetails(personId);
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const [resultCols, setResultCols] = useState<3 | 2>(2);
  const [viewState, setViewState] = useState('tv');
  const [animDelay, setAnimDelay] = useState(0);
  const { imageHeight, imageWidth } = useImageSize(resultCols);
  const flatListRef = useRef(null);

  const handleSegmentChange = (event: any) => {
    const state = event.nativeEvent.selectedSegmentIndex;
    setViewState(state === 0 ? 'tv' : 'movie');

    // Scroll to the top of the FlatList
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the Header
  const animatedHeaderStyle = useAnimatedStyle(() => {
    // Calculate the header height as scrollY increases
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );

    // Important: Don't add translateY for header shrinking
    // This was causing the header to shrink to the middle
    return {
      height: height + 10,
      overflow: 'hidden',
      // Pinned to top as it shrinks (remove translateY transform)
    };
  });

  useLayoutEffect(() => {
    if (!data) return;
    const options: NativeStackNavigationOptions = {
      title: data?.personDetails.name || personId,
      headerLeft: () => <BackHeaderButton />,
      headerRight: () => (
        <Pressable onPress={() => setResultCols((prev) => (prev === 2 ? 3 : 2))}>
          <MotiView
            animate={{
              opacity: resultCols === 2 ? 1 : 0,
              scale: resultCols === 2 ? 1 : 0.1,
            }}
            transition={{
              type: 'timing',
              duration: 400,
            }}
            style={{
              position: 'absolute',
            }}>
            <SymbolView name="square.grid.2x2.fill" tintColor={colors.buttontext} size={25} />
          </MotiView>

          <MotiView
            animate={{
              opacity: resultCols === 3 ? 1 : 0,
              scale: resultCols === 3 ? 1 : 0.1,
            }}
            transition={{
              type: 'timing',
              duration: 400,
            }}>
            <SymbolView name="square.grid.3x3.fill" tintColor={colors.buttontext} size={25} />
          </MotiView>
        </Pressable>
      ),
    };
    navigation.setOptions(options);
  }, [data?.personDetails, resultCols]);

  // Prepare data for FlatList - group items into rows for our custom grid layout
  const getListData = useCallback(() => {
    if (!data) return [];

    // Get the raw data based on view state
    let rawItems = [];
    if (viewState === 'tv') {
      rawItems = reTagPersonShows(savedShows$.shows.peek(), data.tvShows);
    } else {
      rawItems = data.movies || [];
    }

    // For very small lists (or empty lists), just return the items
    if (rawItems.length <= resultCols) {
      return rawItems;
    }

    // Process items to create rows for our grid layout
    // This way the FlatList thinks it's rendering rows, but our renderItem
    // is actually rendering grid cells
    const groupedItems = [];
    for (let i = 0; i < rawItems.length; i += resultCols) {
      // Create a group of up to resultCols items
      const groupSize = Math.min(resultCols, rawItems.length - i);
      const rowItems = [];

      for (let j = 0; j < groupSize; j++) {
        rowItems.push(rawItems[i + j]);
      }

      groupedItems.push({
        id: `row-${i}`,
        items: rowItems,
      });
    }

    return groupedItems;
  }, [data, viewState, resultCols]);

  // Render item function for FlatList with proper row layout
  const renderItem = useCallback(
    ({ item, index }) => {
      // If we're using the original data format (for very small lists)
      if (!item.items) {
        return (
          <View
            style={{
              width: `${100 / resultCols}%`,
              paddingHorizontal: 8,
              marginBottom: 25,
            }}>
            {viewState === 'tv' ? (
              <PersonShowItem
                key={`single-${item.tvShowId}-${index}`}
                showItem={item}
                numColumns={resultCols}
                currentShowId={currentShowId}
              />
            ) : (
              <PersonMovieItem
                key={`single-${item.movieId}-${index}`}
                movieItem={item}
                numColumns={resultCols}
              />
            )}
          </View>
        );
      }

      // Render a row of items
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 25,
          }}>
          {item.items.map((rowItem, rowIndex) => (
            <View
              key={`row-${index}-item-${rowIndex}`}
              style={{
                // width: `${100 / resultCols}%`,
                width: screenWidth / resultCols,
                paddingHorizontal: 8,
                // borderWidth: 1,
              }}>
              {viewState === 'tv' ? (
                <PersonShowItem
                  key={`tv-${rowItem.tvShowId}-${rowIndex}`}
                  showItem={rowItem}
                  numColumns={resultCols}
                  currentShowId={currentShowId}
                />
              ) : (
                <PersonMovieItem
                  key={`movie-${rowItem.movieId}-${rowIndex}`}
                  movieItem={rowItem}
                  numColumns={resultCols}
                />
              )}
            </View>
          ))}

          {/* Add empty placeholder Views if the row isn't completely filled */}
          {Array.from({ length: resultCols - item.items.length }).map((_, emptyIndex) => (
            <View
              key={`empty-${index}-${emptyIndex}`}
              style={{
                width: `${100 / resultCols}%`,
                paddingHorizontal: 8,
              }}
            />
          ))}
        </View>
      );
    },
    [viewState, resultCols, currentShowId]
  );

  // List empty component
  const ListEmptyComponent = useCallback(() => {
    return <Text>No {viewState === 'tv' ? 'TV shows' : 'movies'} available</Text>;
  }, [viewState]);

  // Create ListHeaderComponent to maintain spacing
  const ListHeaderComponent = useCallback(() => {
    return <View style={{ height: HEADER_MAX_HEIGHT + 20 }} />;
  }, []);

  // We no longer need numColumns prop with our custom layout
  // The custom renderItem handles the grid layout manually

  // Update getItemLayout to work with our row-based layout
  const getItemLayout = useCallback(
    (data, index) => {
      const rowHeight = imageHeight + 25; // Height of a single row
      return {
        length: rowHeight,
        offset: rowHeight * index,
        index,
      };
    },
    [imageHeight]
  );

  // Generate a key for each row/item
  const keyExtractor = useCallback(
    (item, index) => {
      // For grouped rows
      if (item.id) {
        return item.id;
      }

      // For single items in small lists
      if (viewState === 'tv') {
        return `tv-${item.tvShowId}-${index}`;
      } else {
        return `movie-${item.movieId}-${index}`;
      }
    },
    [viewState]
  );

  if (isLoading || !data) return null;

  return (
    <View className="flex-1">
      <View>
        <SegmentedControl
          className="w-[100]"
          values={['TV Shows', 'Movies']}
          selectedIndex={viewState === 'tv' ? 0 : 1}
          onChange={handleSegmentChange}
        />
      </View>

      <View className="flex-1 bg-white">
        {/* Animated Header positioned absolutely */}
        <Animated.View
          style={[animatedHeaderStyle, { backgroundColor: `${colors.button}77` }]}
          className="absolute left-0 right-0 top-0 z-10 border-b-hairline border-b-primary">
          <PersonProfile
            personInfo={data.personDetails}
            scrollY={scrollY}
            headerHeight={HEADER_MAX_HEIGHT}
          />
        </Animated.View>

        {/* FlatList that renders the content */}
        <AnimatedFlatList
          ref={flatListRef}
          data={getListData()}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          // Remove numColumns prop - we'll handle layout in renderItem
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          contentContainerStyle={{
            marginBottom: 55,
            // paddingHorizontal: 8, // Add padding to container instead
          }}
          // Add these props for improved performance and layout
          showsVerticalScrollIndicator={false}
          initialScrollIndex={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingBottom: 50,
  },
  headerPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default PersonContainer;
