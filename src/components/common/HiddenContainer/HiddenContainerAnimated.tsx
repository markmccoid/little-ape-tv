import React, { ReactNode, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { ExpandDownIcon, CollapseUpIcon } from '@/components/common/Icons';
import { AnimatePresence, MotiView } from 'moti';
import { measure, useAnimatedRef } from 'react-native-reanimated';

/**
 * Component will take a component as a child and toggle displaying or hiding
 * the content.
 * Will accept a passed "title" prop to display as title
 * Will also accept "startOpen" prop to determine if container is in
 * open state when initially displayed.
 *
 */
type Props = {
  children: ReactNode;
  title: string;
  staticHeight?: number;
  // adds amount to the measured height
  extraHeight?: number;
  style?: ViewStyle;
  startOpen?: boolean;
};

const HiddenContainerAnimated: React.FC<Props> = ({
  children,
  style,
  title,
  extraHeight = 0,
  staticHeight = 0,
  startOpen = false,
}) => {
  const [viewContents, setViewContents] = useState(startOpen);
  const [isMounted, setIsMounted] = useState(false);

  //~ - - -
  const [autoHeight, setAutoHeight] = useState(staticHeight);
  const [isMeasured, setIsMeasured] = useState(!!staticHeight); //If height sent in this will set isMeasured to true so we won't measure.
  const onLayout = (event) => {
    if (isMeasured) return;
    const { height } = event.nativeEvent.layout; // Extract the height from the layout event

    setAutoHeight(height + extraHeight); // Store the height in state
    setIsMeasured(true);
  };
  //~ - - - - - -

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <View
      // style={{
      //   flex: 1,
      //   backgroundColor: '#ffffff85',
      //   borderTopColor: '#777',
      //   borderBottomColor: '#777',
      //   borderBottomWidth: StyleSheet.hairlineWidth, //viewContents ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
      //   borderTopWidth: StyleSheet.hairlineWidth,
      // }}
      className="flex-1 border-b-hairline border-t-hairline bg-[#ffffff85]">
      {/* Is only here to measure the height of the children so we know 
            what the hieght is for our animation
        */}
      {!isMeasured && (
        <View className="absolute opacity-0" onLayout={onLayout}>
          {children}
        </View>
      )}
      <Pressable
        // style={({ pressed }) => [
        //   {
        //     flex: 1,
        //     borderBottomColor: '#777',
        //     borderBottomWidth: 1,
        //     backgroundColor: '#ffffff77',
        //     opacity: pressed ? 0.6 : 1,
        //   },
        // ]}
        className="flex-1 border-b-hairline bg-[rgba(255,255,255,0.4)] py-2"
        onPress={() => setViewContents((prev) => !prev)}>
        <View className="flex-row items-center justify-between">
          <View className="pl-4">
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginRight: 15 }}>{title}</Text>
          </View>
          <View className="pr-4">
            <MotiView
              key="1"
              from={{ transform: [{ rotateZ: !isMounted || viewContents ? '0deg' : '180deg' }] }}
              animate={{
                transform: [{ rotateZ: !isMounted || viewContents ? '180deg' : '0deg' }],
              }}>
              <ExpandDownIcon size={20} />
            </MotiView>
          </View>
        </View>
      </Pressable>

      <MotiView
        from={{ height: !isMounted || viewContents ? 0 : autoHeight }}
        animate={{ height: !isMounted || viewContents ? autoHeight : 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="overflow-hidden">
        <AnimatePresence>
          {viewContents && (
            <MotiView
              from={{ opacity: 0, translateY: autoHeight * -1 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: autoHeight * -1 }}
              key={1}
              transition={{ type: 'timing', duration: 500 }}
              exitTransition={{ type: 'timing', duration: 500 }}>
              {children}
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </View>
  );
};

export default HiddenContainerAnimated;

const styles = StyleSheet.create({});
