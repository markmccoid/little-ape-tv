import React, { ReactNode, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { Text, View, Pressable, ViewStyle, LayoutChangeEvent } from 'react-native';
import { ExpandDownIcon } from '@/components/common/Icons';
import { AnimatePresence, MotiView } from 'moti';

type Props = {
  children: ReactNode;
  title: string;
  staticHeight?: number;
  extraHeight?: number;
  style?: ViewStyle;
  startOpen?: boolean;
  animationDuration?: number;
  setOpenStatus?: (isOpen: boolean) => void;
};

const HiddenContainerAnimated: React.FC<Props> = ({
  children,
  style,
  title,
  extraHeight = 0,
  staticHeight = 0,
  startOpen = false,
  animationDuration = 500,
  setOpenStatus = () => {},
}) => {
  // Refs
  const contentRef = useRef<View>(null);

  // States
  const [isOpen, setIsOpen] = useState(startOpen);
  const [contentHeight, setContentHeight] = useState(staticHeight);
  const [isContentMeasured, setIsContentMeasured] = useState(!!staticHeight);

  // Toggle function
  const toggleContainer = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    setOpenStatus(newState);
  }, [isOpen, setOpenStatus]);

  // Measure content height
  const measureContent = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && !isContentMeasured) {
        setContentHeight(height + extraHeight);
        setIsContentMeasured(true);
      }
    },
    [extraHeight, isContentMeasured]
  );

  // Use useLayoutEffect to measure content as soon as possible
  useLayoutEffect(() => {
    // If we have a static height, we don't need to measure
    if (staticHeight > 0) {
      setContentHeight(staticHeight + extraHeight);
      setIsContentMeasured(true);
      return;
    }

    // Try to measure the content immediately if it's mounted
    if (contentRef.current) {
      contentRef.current.measure((_x, _y, _width, height) => {
        if (height > 0) {
          setContentHeight(height + extraHeight);
          setIsContentMeasured(true);
        }
      });
    }
  }, [staticHeight, extraHeight]);

  // For images inside the component, you could add image loading tracking
  // This would be particularly useful if you're rendering 6-7 images that are slow to load

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
        },
        style,
      ]}>
      {/* Measurement container */}
      <View
        ref={contentRef}
        onLayout={measureContent}
        style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
        {children}
      </View>

      {/* Header/Toggle section */}
      <Pressable
        style={{
          borderBottomWidth: 0.5,
          backgroundColor: 'rgba(255, 255, 255, .7)',
          paddingVertical: 8,
        }}
        onPress={toggleContainer}
        disabled={!isContentMeasured} // Only enable toggle after content is measured
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ paddingLeft: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
          </View>
          <View style={{ paddingRight: 16 }}>
            <MotiView
              animate={{ transform: [{ rotateZ: isOpen ? '180deg' : '0deg' }] }}
              transition={{ type: 'timing', duration: animationDuration / 2 }}>
              <ExpandDownIcon size={20} />
            </MotiView>
          </View>
        </View>
      </Pressable>

      {/* Animated content container */}
      {isContentMeasured && (
        <MotiView
          animate={{ height: isOpen ? contentHeight : 0 }}
          transition={{ type: 'timing', duration: animationDuration }}
          style={{ overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, .1)' }}>
          <AnimatePresence>
            {isOpen && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="content"
                transition={{ type: 'timing', duration: animationDuration }}>
                {children}
              </MotiView>
            )}
          </AnimatePresence>
        </MotiView>
      )}
    </View>
  );
};

export default HiddenContainerAnimated;

// import React, { ReactNode, useState } from 'react';
// import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
// import { ExpandDownIcon, CollapseUpIcon } from '@/components/common/Icons';
// import { AnimatePresence, MotiView } from 'moti';
// import { measure, useAnimatedRef } from 'react-native-reanimated';

// /**
//  * Component will take a component as a child and toggle displaying or hiding
//  * the content.
//  * Will accept a passed "title" prop to display as title
//  * Will also accept "startOpen" prop to determine if container is in
//  * open state when initially displayed.
//  *
//  */
// type Props = {
//   children: ReactNode;
//   title: string;
//   staticHeight?: number;
//   // adds amount to the measured height
//   extraHeight?: number;
//   style?: ViewStyle;
//   startOpen?: boolean;
//   // supposed to be a callback letting parent know state of container
//   setOpenStatus?: (isOpen: boolean) => void;
// };

// const HiddenContainerAnimated: React.FC<Props> = ({
//   children,
//   style,
//   title,
//   extraHeight = 0,
//   staticHeight = 0,
//   startOpen = false,
//   setOpenStatus = (isOpen) => {},
// }) => {
//   const [viewContents, setViewContents] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   //~ - - -
//   const [autoHeight, setAutoHeight] = useState(staticHeight);
//   const [isMeasured, setIsMeasured] = useState(!!staticHeight); //If height sent in this will set isMeasured to true so we won't measure.
//   const onLayout = (event) => {
//     if (isMeasured) return;
//     const { height } = event.nativeEvent.layout; // Extract the height from the layout event

//     setAutoHeight(height + extraHeight); // Store the height in state
//     setIsMeasured(true);
//   };
//   //~ - - - - - -

//   React.useEffect(() => {
//     setOpenStatus(viewContents);
//     setIsMounted(true);
//     const timeout = setTimeout(() => setViewContents(startOpen), 75);
//     // Cleanup function to clear the timeout
//     return () => clearTimeout(timeout);
//   }, []);

//   return (
//     <View className="flex-1 border-b-hairline border-t-hairline bg-[#ffffff85]">
//       {/* Is only here to measure the height of the children so we know
//             what the hieght is for our animation
//         */}
//       {!isMeasured && (
//         <View className="absolute opacity-0" onLayout={onLayout}>
//           {children}
//         </View>
//       )}
//       <Pressable
//         className="flex-1 border-b-hairline bg-[rgba(255,255,255,0.4)] py-2"
//         onPress={() => {
//           setViewContents((prev) => {
//             setOpenStatus(!prev);
//             return !prev;
//           });
//         }}>
//         <View className="flex-row items-center justify-between">
//           <View className="pl-4">
//             <Text style={{ fontSize: 20, fontWeight: 'bold', marginRight: 15 }}>{title}</Text>
//           </View>
//           <View className="pr-4">
//             <MotiView
//               key="1"
//               from={{ transform: [{ rotateZ: !isMounted || viewContents ? '0deg' : '180deg' }] }}
//               animate={{
//                 transform: [{ rotateZ: !isMounted || viewContents ? '180deg' : '0deg' }],
//               }}>
//               <ExpandDownIcon size={20} />
//             </MotiView>
//           </View>
//         </View>
//       </Pressable>

//       <MotiView
//         // from={{ height: !isMounted || viewContents ? (startOpen ? autoHeight : 0) : autoHeight }}
//         from={{ height: !isMounted || viewContents ? 0 : autoHeight }}
//         animate={{ height: !isMounted || viewContents ? autoHeight : 0 }}
//         transition={{ type: 'timing', duration: 500 }}
//         className="overflow-hidden">
//         <AnimatePresence>
//           {viewContents && (
//             <MotiView
//               from={{ opacity: 0, translateY: autoHeight * -1 }}
//               animate={{ opacity: 1, translateY: 0 }}
//               exit={{ opacity: 0, translateY: autoHeight * -1 }}
//               key={1}
//               transition={{ type: 'timing', duration: 500 }}
//               exitTransition={{ type: 'timing', duration: 500 }}>
//               {children}
//             </MotiView>
//           )}
//         </AnimatePresence>
//       </MotiView>
//     </View>
//   );
// };

// export default HiddenContainerAnimated;

// const styles = StyleSheet.create({});
