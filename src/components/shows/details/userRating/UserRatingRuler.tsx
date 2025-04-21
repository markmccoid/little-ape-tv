import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, TextStyle, View } from 'react-native';
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import UserRatingRulerText from './UserRatingRulerText';
import { FlatList } from 'react-native-gesture-handler';

const _spacing = 30;
const _rulerHeight = 24;
const _rulerWidth = 2;
const _itemSize = _spacing;
const width = 300;
// const { width } = Dimensions.get('window');

type RulerLineProps = {
  index: number;
  scrollX: SharedValue<number>;
  onItemPress: (index: number) => void;
};
// This is just each line of the ruler.  Making it larger as it gets closer to the center
function RulerLine({ index, scrollX, onItemPress }: RulerLineProps) {
  const handlePress = () => {
    console.log('INDEX', index, scrollX.value);
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
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [0.9, 1.5, 0.9],
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
            paddingRight: 14,
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
        <View style={stylez}>
          <Text>{index}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
type AnimatedTextProps = {
  value: SharedValue<number>;
  style?: TextStyle;
};
Animated.addWhitelistedNativeProps({ text: true });

function AnimatedText({ value, style = undefined }: AnimatedTextProps) {
  const animatedPropz = useAnimatedProps(() => {
    return {
      text: String(Math.round(value.value)),
    };
  });
  return (
    <AnimatedTextInput
      underlineColorAndroid={'transparent'}
      editable={false}
      defaultValue={String(value.value)}
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
  );
}

type RulerProps = {
  onChange?: (value: number) => void;
  fadeColor?: string;
  ticks?: number;
  startingTick?: number;
};
export function Ruler({
  onChange,
  fadeColor = '#ffffff',
  ticks = 12,
  startingTick = 0,
}: RulerProps) {
  const data = useMemo(() => [...Array(ticks).keys()], [ticks]);
  const scrollX = useSharedValue(startingTick);
  const flatListRef = useRef<FlatList>(null);
  const handleItemPress = useCallback((index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = clamp(e.contentOffset.x / _itemSize, 0, data.length - 1);
      console.log(scrollX.value, e.contentOffset.x);
    },
    onMomentumEnd: (e) => {
      // set some state here, maybe call a callback
      if (onChange) {
        runOnJS(onChange)(Math.floor(scrollX.value));
      }
    },
  });
  const animatedPropz = useAnimatedProps(() => {
    return {
      text: String(Math.round(scrollX.value)),
    };
  });
  return (
    <View style={{ justifyContent: 'center' }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: _spacing,
          // width: 40,
          borderWidth: 1,
        }}>
        <AnimatedText value={scrollX} />
        {/* <UserRatingRulerText scrollX={scrollX} /> */}
      </View>
      <View>
        <Animated.FlatList
          data={data}
          ref={flatListRef}
          keyExtractor={(item) => String(item)}
          horizontal
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          snapToInterval={_itemSize}
          contentContainerStyle={{
            borderWidth: 1,
            // width: _itemSize * data.length,
            flexDirection: 'row',
            justifyContent: 'center',
            //marginLeft: 50,
            paddingHorizontal: width / 2 - _itemSize / 2,
            // alignItems: "flex-end",
          }}
          renderItem={({ index }) => {
            return <RulerLine index={index} scrollX={scrollX} onItemPress={handleItemPress} />;
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
        <View
          style={{
            alignSelf: 'center',
            position: 'absolute',
            height: _rulerHeight,
            // height: _rulerHeight + _rulerWidth * 4,
            // width: _rulerWidth,
            width: _itemSize,
            borderWidth: _rulerWidth,
            // top: -_rulerWidth * 2,
            // opacity: 0.5,
            // backgroundColor: '',
          }}
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
