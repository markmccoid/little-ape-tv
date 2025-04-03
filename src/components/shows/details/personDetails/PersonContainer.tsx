import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { usePersonDetails } from '~/data/query.shows';
// import ShowImage from '~/components/common/ShowImage'; // Assuming not needed directly here
// import SearchItem from '~/components/search/SearchItem'; // Assuming not needed directly here
import { reTagPersonShows } from '~/store/functions-shows';
import { savedShows$ } from '~/store/store-shows';
import PersonShowItem from './PersonShowItem';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import PersonProfile from './PersonProfile'; // Assuming PersonProfile renders correctly with given props
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation, // Use Extrapolation consistently
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

type Props = {
  personId: string;
  currentShowId: string;
};

// Define constants for header height animation
const HEADER_MAX_HEIGHT = 210; // Initial height of the profile section
const HEADER_MIN_HEIGHT = 0; // Height it shrinks down to (can be > 0 if you want a minimal header)
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT; // The scroll distance over which the header collapses

const PersonContainer = ({ personId, currentShowId }: Props) => {
  const { colors } = useCustomTheme();
  const { data, isLoading } = usePersonDetails(personId);
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const [resultCols, setResultCols] = useState(2);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated style for the Header (PersonProfile container) *inside* the ScrollView
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE], // Input range: scroll 0 to point where collapse is complete
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT], // Output range: height shrinks
      Extrapolation.CLAMP // Clamp height at min/max
    );

    // Translate Y to counteract the scroll, making it "sticky"
    // It moves up (negative translate) initially, but we push it down (positive translate)
    // by the same amount as the scroll, clamping as the total collapse distance.
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, HEADER_SCROLL_DISTANCE], // Start at 0 translation
      Extrapolation.CLAMP // Need this so that picture doesn't stick to top when scroll pulled down
    );

    return {
      height: height + 10,
      transform: [{ translateY }], // Apply the counter-scroll translation
      // Important: Add overflow hidden so content inside PersonProfile gets clipped
      overflow: 'hidden',
    };
  });

  // Animated style for the list container *below* the header
  // We push this down initially by the header height, and this margin doesn't change.
  // OR - Simpler: Just let the list render naturally below the Animated.View header.

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

  if (isLoading || !data) return null;

  const taggedTV = reTagPersonShows(savedShows$.shows.peek(), data.tvShows);

  return (
    <View className="flex-1">
      {/* ScrollView now contains everything */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1 bg-white pt-2"
        // Add bottom padding to content container if needed (e.g., for tab bar)
        contentContainerStyle={styles.scrollContentContainer}>
        {/* 1. The Animated Header */}
        <Animated.View
          style={[animatedHeaderStyle]}
          className="absolute bottom-0 left-0 right-0 top-0 z-10 border-b-hairline border-b-primary">
          <PersonProfile
            personInfo={data.personDetails}
            scrollY={scrollY}
            headerHeight={HEADER_MAX_HEIGHT}
          />
        </Animated.View>

        {/* 2. The List Content - Renders naturally below the header */}
        <View
          className="flex-row flex-wrap justify-between px-[8]"
          style={{ paddingTop: HEADER_MAX_HEIGHT + 20 }}>
          {taggedTV.map((show, index) => {
            return (
              <PersonShowItem
                key={show.tvShowId.toString() + index}
                showItem={show}
                numColumns={resultCols as 2 | 3}
                currentShowId={currentShowId}
                // Adjust className if needed based on new parent (View vs ScrollView contentContainer)
                // className="justify-between" // May not be needed here if listContainer handles layout
              />
            );
          })}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContentContainer: {
    // Add padding at the bottom if content scrolls behind a tab bar etc.
    paddingBottom: 50, // Example padding
  },
  // This View receives the animated height and translateY
  headerPlaceholder: {
    // backgroundColor: 'lightblue', // For debugging layout
    // Height and Transform are set by animatedHeaderStyle
    // overflow: 'hidden' is crucial and set in animatedHeaderStyle
    position: 'absolute', // Make it overlay content initially
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it renders above the list content while translating
  },
  // This View contains the actual list items
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8, // Use padding instead of mx-2 for consistency
    // Crucially, add top padding/margin equal to the header's initial height
    // so the list starts *below* the header initially.
    paddingTop: HEADER_MAX_HEIGHT,
  },
  // Add style for PersonProfile if needed to make it fill its container
  // profileContainer: {
  //    flex: 1,
  // }
});

export default PersonContainer;
