import React, { useEffect, useReducer, useRef, useState } from 'react';
import { savedShows$, tags$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';
import TagCloudEnhanced, { TagItem } from '~/components/common/TagCloud/TagCloudEnhanced';
import Animated, {
  BounceIn,
  BounceOut,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LayoutChangeEvent, Pressable, View, Text, StyleSheet } from 'react-native';
import { useCustomTheme } from '~/utils/customColorTheme';
import { MotiView } from 'moti';
import { HeartIcon, TagIcon, TagPlusIcon } from '~/components/common/Icons';
import ShadowBackground from '~/components/common/ShadowBackground';
import { SymbolView } from 'expo-symbols';
import SetFavoriteButton from './SetFavoriteButton';

type Props = {
  showId: string | undefined;
};
const ShowTagContainer = ({ showId }: Props) => {
  if (!showId) return;
  const isFavorited = use$(savedShows$.shows[showId].favorite);
  const { colors } = useCustomTheme();
  const matchedTags = use$(tags$.matchTagIds(savedShows$.shows[showId].userTags.get()));
  const [showTags, toggleShowTags] = useReducer((el) => !el, false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const toHeight = useSharedValue(0);

  //~ Toggle state (add/remove tags)
  const toggleTagState = (tagId: string) => {
    const foundTag = matchedTags.find((el) => el.id === tagId);
    if (!foundTag) return;
    if (foundTag.state === 'include') {
      savedShows$.updateShowTags(showId, tagId, 'remove');
    } else {
      savedShows$.updateShowTags(showId, tagId, 'add');
    }
  };
  const onLayout = (event: LayoutChangeEvent) => {
    if (isMeasured) return;
    const height = event.nativeEvent.layout.height;

    setContainerHeight(height > 1 ? height + 16 : height);
    setIsMeasured(true);
  };

  const tagViewStyle = useAnimatedStyle(() => {
    toHeight.value = showTags ? withTiming(containerHeight) : withTiming(0);

    return {
      height: toHeight.value,
      opacity: interpolate(toHeight.value, [containerHeight, 0], [1, 0]),
      marginTop: interpolate(
        toHeight.value,
        [containerHeight, 0],
        [containerHeight === 0 ? 0 : 10, 0]
      ),
    };
  }, [isMeasured, showTags]);

  return (
    <MotiView
      className="relative mx-2 border-0"
      from={{ marginBottom: 0 }}
      animate={{ marginBottom: showTags ? 20 : 0 }}
      transition={{ type: 'timing', duration: 500 }}
      exit={{ marginBottom: 0 }}>
      {/* Only used to get a height for the Tag list */}
      {!isMeasured && (
        <View onLayout={onLayout} className="absolute  opacity-0">
          <TagCloudEnhanced>
            {matchedTags?.map((el) => (
              <TagItem
                size="s"
                onToggleTag={toggleTagState}
                state={el.state}
                tagId={el.id}
                tagName={el?.name}
                key={el?.id}
                type="boolean"
              />
            ))}
          </TagCloudEnhanced>
        </View>
      )}
      <View className="flex-row items-center">
        <Pressable onPress={toggleShowTags} className="">
          <Animated.View
            className="mr-1 flex-row items-center rounded-lg px-3 py-1"
            layout={LinearTransition.duration(300)}
            style={{ width: 'auto', backgroundColor: colors.primary }}>
            <MotiView
              from={{ rotate: '-45deg' }}
              animate={{ rotate: showTags ? '-135deg' : '-45deg' }}>
              <TagPlusIcon size={25} color={colors.primarytext} />
            </MotiView>
            {matchedTags?.length === 0 && !showTags && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: showTags ? 0 : 1 }}
                transition={{ type: 'timing', duration: 700 }}>
                <Text className="text-secondary-foreground ml-3 mr-2 text-base font-semibold">
                  Add Tags
                </Text>
              </MotiView>
            )}
          </Animated.View>
        </Pressable>
        <Animated.FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={matchedTags.filter((el) => el.state === 'include')}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <Pressable onPress={() => toggleTagState(item.id)}>
                <Animated.View
                  className={`mr-[5] flex-row items-center justify-center rounded-lg border-hairline px-[5] py-[2]
                  ${showTags ? 'opacity-55' : 'opacity-100'} `}
                  style={{ backgroundColor: colors.includeGreen }}
                  key={item.id}
                  entering={BounceIn.duration(100)}
                  exiting={BounceOut.duration(100)}>
                  <Text>{item.name}</Text>
                </Animated.View>
              </Pressable>
            );
          }}
          itemLayoutAnimation={LinearTransition}
        />
      </View>
      <View
        className={`absolute bottom-[-20] z-30 ${showTags ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <SetFavoriteButton showId={showId} isFavorited={!!isFavorited} isDisplayed={showTags} />
      </View>
      {/* <Pressable
        onPress={() => savedShows$.toggleFavoriteShow(showId, 'toggle')}
        className={`absolute bottom-[-20] z-30 ${showTags ? 'pointer-events-auto' : 'pointer-events-none'} `}
        disabled={!showTags}>
        <MotiView
          key="A"
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showTags ? 100 : 0, scale: showTags ? 1 : 0 }}
          transition={{ type: 'timing', duration: 500 }}
          exit={{ opacity: 0 }}>
          <SymbolView
            name="heart.circle.fill"
            type="palette"
            colors={[isFavorited ? 'red' : 'white', colors.primary]}
            size={35}
          />
        </MotiView>
      </Pressable> */}
      <Animated.View
        style={[
          tagViewStyle,
          {
            overflow: 'hidden', // Ensure contents are clipped
            // backgroundColor: '#f0f0f0',
            borderRadius: 10,
            borderWidth: showTags ? StyleSheet.hairlineWidth : 0,
            paddingVertical: showTags ? 8 : 0,
          },
        ]}>
        <ShadowBackground />
        <TagCloudEnhanced>
          {matchedTags?.map((el) => (
            <TagItem
              size="s"
              onToggleTag={toggleTagState}
              state={el.state}
              tagId={el.id}
              tagName={el?.name}
              key={el?.id}
              type="boolean"
            />
          ))}
        </TagCloudEnhanced>
      </Animated.View>
    </MotiView>
  );
};

export default ShowTagContainer;
