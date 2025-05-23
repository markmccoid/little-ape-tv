import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, TextStyle, View } from 'react-native';
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FlatList } from 'react-native-gesture-handler';
import { settings$ } from '~/store/store-settings';

const _spacing = 24;
const _rulerHeight = 35;
const _rulerWidth = 2;
const _itemSize = _spacing;
const width = 300;
// const { width } = Dimensions.get('window');

type RulerLineProps = {
  index: number;
  scrollX: SharedValue<number>;
  onItemPress: (index: number) => void;
};

//~ ---------------------------------------------
//~ Ruler Render Value 0 - nn
//~ ---------------------------------------------
function RulerRenderValue({ index, scrollX, onItemPress }: RulerLineProps) {
  const handlePress = () => {
    // console.log('INDEX', index, scrollX.value);
    // Call the callback passed from the parent, providing the index
    if (onItemPress) {
      onItemPress(index);
    }
  };

  const stylez = useAnimatedStyle(() => {
    return {
      // height: interpolate(
      //   scrollX.value,
      //   [index - 1, index, index + 1],
      //   [_rulerHeight - 1, _rulerHeight, _rulerHeight - 1]
      // ),
      opacity: interpolate(
        scrollX.value,
        [index - 1, index, index + 1],
        [1, 0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [0.9, 1.5, 0.9],
            Extrapolation.CLAMP
          ),
        },
        {
          translateY: interpolate(
            scrollX.value,
            [index - 2, index - 1, index, index + 1, index + 2],
            [1, -1.5, -15, -1.5, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: _itemSize, alignItems: 'center' /* or other layout */ }}>
      <Animated.View
        style={[
          {
            height: _rulerHeight,
            width: _itemSize,
            justifyContent: 'center',
            alignItems: 'center',
          },
          stylez,
        ]}>
        {/* <View
        style={{
          width: _rulerWidth,
          height: '100%',
          backgroundColor: 'black',
          opacity: 0.3,
        }}
      /> */}
        <Animated.View style={{}}>
          <Text style={{ fontSize: 20 }}>{index}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

//~ ---------------------------------------------
//~ Animated Text Value showing ABOVE "dial"
//~ ---------------------------------------------
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
type AnimatedTextProps = {
  value: SharedValue<number>;
  initialValue?: number;
  style?: TextStyle;
  onRatingPress: () => void;
};
Animated.addWhitelistedNativeProps({ text: true });

function AnimatedText({
  value,
  initialValue = 0,
  onRatingPress,
  style = undefined,
}: AnimatedTextProps) {
  const animatedPropz = useAnimatedProps(() => {
    return {
      text: String(Math.round(value.value)),
    };
  });
  return (
    <Pressable
      onPress={onRatingPress}
      className="py-1/2 z-10 border-hairline bg-yellow-200 px-2"
      style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
      <AnimatedTextInput
        underlineColorAndroid={'transparent'}
        pointerEvents="none"
        editable={false}
        defaultValue={String(initialValue)}
        animatedProps={animatedPropz}
        style={[
          {
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: -2,
            fontVariant: ['tabular-nums'],
            width: 40,
          },
          style,
        ]}
      />
    </Pressable>
  );
}

//~ ---------------------------------------------
//~ MAIN COMPONENT Dail/Rule with Above Value
//~ ---------------------------------------------
type RulerProps = {
  onChange?: (value: number) => void;
  fadeColor?: string;
  ticks?: number;
  startingTick?: number;
  onRatingPress?: () => void;
};
export function Ruler({
  onChange,
  fadeColor = '#ffffff',

  startingTick = 0,
  onRatingPress = () => {},
}: RulerProps) {
  const ticks = settings$.userRatingMax.peek() + 1;
  const data = useMemo(() => [...Array(ticks).keys()], [ticks]);
  const scrollX = useSharedValue(startingTick);
  const flatListRef = useRef<FlatList>(null);
  const handleItemPress = useCallback((index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  }, []);
  const lastHapticIndex = useRef(-1);
  const checkHapticFeedback = useCallback(
    (currentIndex: number) => {
      // Only trigger haptic if we've moved to a new index
      if (
        currentIndex !== lastHapticIndex.current &&
        currentIndex >= 0 &&
        currentIndex < data.length
      ) {
        lastHapticIndex.current = currentIndex;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [data.length]
  );
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = clamp(e.contentOffset.x / _itemSize, 0, data.length - 1);
      runOnJS(checkHapticFeedback)(Math.floor(scrollX.value));
      // console.log(scrollX.value, e.contentOffset.x);
    },
    onMomentumEnd: (e) => {
      // set some state here, maybe call a callback
      if (onChange) {
        runOnJS(onChange)(Math.floor(scrollX.value));
      }
    },
  });

  return (
    <View style={{ justifyContent: 'center' }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          // marginBottom: _spacing,
          // width: 40,
        }}>
        {/* <Text className="text-xl font-semibold">User Rating</Text> */}
        <AnimatedText value={scrollX} initialValue={startingTick} onRatingPress={onRatingPress} />
      </View>
      <View className="overflow-hidden rounded-xl border-hairline">
        <Animated.FlatList
          data={data}
          ref={flatListRef}
          keyExtractor={(item) => String(item)}
          horizontal
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          snapToInterval={_itemSize}
          contentContainerStyle={{
            // borderWidth: StyleSheet.hairlineWidth,
            // borderRadius: 10,
            // width: _itemSize * data.length,
            flexDirection: 'row',
            justifyContent: 'center',
            //marginLeft: 50,
            paddingHorizontal: width / 2 - _itemSize / 2,
            backgroundColor: '#6D975377',
            // paddingHorizontal: width / 2 - (_itemSize + 14) / 2,
            // alignItems: "flex-end",
          }}
          renderItem={({ index }) => {
            return (
              <RulerRenderValue index={index} scrollX={scrollX} onItemPress={handleItemPress} />
            );
          }}
          // Scrolling
          onScroll={onScroll}
          scrollEventThrottle={1000 / 60} // ~16ms
          initialScrollIndex={startingTick}
          getItemLayout={(data, index) => ({
            length: _itemSize,
            offset: _itemSize * index,
            index,
          })}
        />
        <LinearGradient
          style={[StyleSheet.absoluteFillObject]}
          colors={[fadeColor, `${fadeColor}00`, `${fadeColor}00`, fadeColor]}
          start={[0, 0.5]}
          end={[1, 0.5]}
          locations={[0, 0.3, 0.7, 1]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}
