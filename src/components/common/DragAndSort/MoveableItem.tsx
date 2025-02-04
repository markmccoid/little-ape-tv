import React, { useState } from "react";
import { Platform, View } from "react-native";
import { MotiView, Text, AnimatePresence } from "moti";
import { clamp } from "react-native-redash";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  scrollTo,
  SharedValue,
  AnimatedRef,
} from "react-native-reanimated";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { DragIndicatorProps, DragIndicatorConfig } from "./DefaultDragIndicator";
import { Positions } from "./helperFunctions";
import { usePositions } from "./DragSortContext";

interface Props {
  id: number | string;
  scrollY: SharedValue<number>;
  scrollViewRef: AnimatedRef<Animated.ScrollView>;
  numberOfItems: number;
  handlePosition: "left" | "right";
  containerHeight: number;
  handle: React.FC;
  enableHapticFeedback: boolean;
  enableDragIndicator: boolean;
  dragIndicator: React.FC<DragIndicatorProps>;
  dragIndicatorConfig: Partial<DragIndicatorConfig>;
  updatePositions: (positions: Positions) => void;
  positionState: Positions;
  setPositionState: (state: Positions) => void;
  itemHeight: number;
  children: React.ReactElement<{ id: number | string }>;
}

//*-----------------
function objectMove(object: Positions, from: number, to: number) {
  "worklet";
  const newObject = { ...object };

  for (const id in object) {
    if (object[id] === from) {
      newObject[id] = to;
    }

    if (object[id] === to) {
      newObject[id] = from;
    }
  }

  return newObject;
}

const MoveableItem = ({
  id,
  scrollY,
  scrollViewRef,
  numberOfItems,
  handlePosition,
  containerHeight,
  updatePositions,
  positionState,
  setPositionState,
  children,
  itemHeight,
  handle,
  enableDragIndicator,
  dragIndicator,
  dragIndicatorConfig,
  enableHapticFeedback,
}: Props) => {
  // const positions = usePositions();
  const Handle = handle;
  const DragIndicator = dragIndicator;

  // const moving = useSharedValue(false);
  const [moving, setMoving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const scale = useSharedValue({ x: 1, y: 1 });
  const [movingPos, setMovingPos] = useState(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const initialRender = useSharedValue(true);
  const contentHeight = React.useMemo(() => numberOfItems * itemHeight, [numberOfItems]);
  const boundY = numberOfItems * itemHeight - itemHeight;
  const ctxStartingY = useSharedValue(0);

  React.useEffect(() => {
    if (positionState[id] !== undefined) {
      setMovingPos(positionState[id] + 1);
      translateY.value = withSpring(positionState[id] * itemHeight);
      // console.log("POS", positionState[id] * itemHeight, id, translateY.value, itemHeight);
    }
  }, [positionState[id]]);
  useAnimatedReaction(
    () => positionState[id],
    (newPosition, previousPosition) => {
      // console.log("in reaction", newPosition, previousPosition, moving, initialRender.value);
      if (newPosition === undefined) return;

      if (newPosition !== previousPosition) {
        if (moving) {
          runOnJS(setMovingPos)(newPosition + 1);
        }
        if (!moving && !initialRender.value) {
          // console.log("New Y Reaction", newPosition);
          translateY.value = withSpring(newPosition * itemHeight);
          runOnJS(setMovingPos)(newPosition + 1);
        } else {
          initialRender.value = false;
        }
      }
    },
    []
  );

  // New Gesture API
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsActive)(true);
      runOnJS(setMoving)(true);
      scale.value = { x: 0.97, y: 0.97 };
      ctxStartingY.value = translateY.value;
      if (Platform.OS === "ios" && enableHapticFeedback) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    })
    .onUpdate((event) => {
      //* Caclulate the Initial new top position of this item
      //* Use the clamp function to make sure it doesn't move outside the bounds of the container
      //* NOTE: the translateY.value will move from zero to the full content height (minus the itemHeight)
      //*     even if the containerHeight is small
      translateY.value = clamp(ctxStartingY.value + event.translationY, 0, boundY);

      //* Calculation the position based on items current Y value
      //* The translateY.value/itemHeight return a decimal between 0 to numberOfItems
      //* I add .5 so that the we get a new position at the center of the next item
      //* whether moving up or down
      const newPosition = clamp(Math.floor(translateY.value / itemHeight + 0.5), 0, numberOfItems);

      //* Check to see if we need to set a new position and do it if so
      if (newPosition !== positionState[id]) {
        runOnJS(setPositionState)(objectMove(positionState, positionState[id], newPosition));
        if (Platform.OS === "ios" && enableHapticFeedback) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      //*--- START Scroll Logic ---
      //* Check to see if we need to scroll the scrollview
      const lowerBound = scrollY.value;
      const upperBound = lowerBound + containerHeight - itemHeight;

      if (translateY.value < lowerBound) {
        const diff = Math.min(lowerBound - translateY.value, lowerBound);
        //Scroll up
        scrollY.value -= diff;
        scrollTo(scrollViewRef, 0, scrollY.value, false);
        ctxStartingY.value -= diff;
        translateY.value = ctxStartingY.value + event.translationY;
      } else if (translateY.value > upperBound) {
        const scrollLeft = contentHeight - containerHeight - scrollY.value;
        //Scroll down
        const diff = Math.min(translateY.value - upperBound, scrollLeft);
        scrollY.value += diff;
        scrollTo(scrollViewRef, 0, scrollY.value, false);
        ctxStartingY.value += diff;
        translateY.value = ctxStartingY.value + event.translationY;
      }
      //*--- END Scroll Logic

      //*----- Scroll Logic Take 2 ------------
      // set the lower and upper bound dynamically as we update the scroll position
      // scrollY will always be the lower bound and
      // the upper bound will be
      //*----- END Scroll Logic Take 2 ------------

      // translateY.value = positionY;
    })
    .onEnd((event) => {
      runOnJS(setIsActive)(false);
      runOnJS(setMoving)(false);
      scale.value = { x: 1, y: 1 };
      translateY.value = withSpring(positionState[id] * itemHeight);
      runOnJS(updatePositions)(positionState);
    })
    .onFinalize((e) => {
      // If on finalize we are in the failed state, assum onEnd didn't run and cleanup
      if (e.state === State.FAILED) {
        runOnJS(setIsActive)(false);
        runOnJS(setMoving)(false);
        scale.value = { x: 1, y: 1 };
        translateY.value = withSpring(positionState[id] * itemHeight);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    flexDirection: "row",
    flex: 1,
    width: "100%",
    left: 0,
    right: 0,
    top: 0,
    zIndex: moving ? 1 : 0,
    shadowColor: "black",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: moving ? 1 : 0,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scaleX: scale.value.x },
    ],
    shadowRadius: 10,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {handlePosition === "right" && (
        <View style={{ flex: 1 }}>
          {React.cloneElement(children as React.ReactElement<any>, { isMoving: moving })}
          <AnimatePresence>
            {isActive && enableDragIndicator && (
              <DragIndicator
                itemHeight={itemHeight}
                fromLeftOrRight="left"
                currentPosition={movingPos}
                totalItems={numberOfItems}
                config={dragIndicatorConfig}
              />
            )}
          </AnimatePresence>
        </View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Handle />
        </Animated.View>
      </GestureDetector>
      {handlePosition === "left" && (
        <View style={{ flex: 1 }}>
          {React.cloneElement(children as React.ReactElement<any>, { isMoving: false })}
          <AnimatePresence>
            {isActive && enableDragIndicator && (
              <DragIndicator
                itemHeight={itemHeight}
                fromLeftOrRight="right"
                currentPosition={movingPos}
                totalItems={numberOfItems}
                config={dragIndicatorConfig}
              />
            )}
          </AnimatePresence>
        </View>
      )}
    </Animated.View>
  );
};

export default MoveableItem;
