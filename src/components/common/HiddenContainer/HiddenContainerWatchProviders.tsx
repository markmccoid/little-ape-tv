import React, { ReactNode, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable, ViewStyle, ScrollView } from "react-native";
import { ExpandDownIcon, CollapseUpIcon } from "@/components/common/Icons";
import { AnimatePresence, MotiView } from "moti";
import { useMovieWatchProviders } from "@/store/dataHooks";
import { useCustomTheme } from "@/lib/colorThemes";

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
  height: number;
  style?: ViewStyle;
  startOpen?: boolean;
  movieId: number;
};

const HiddenContainerWatchProviders: React.FC<Props> = ({
  children,
  movieId,
  style,
  title,
  height,
  startOpen = false,
}) => {
  const [viewContents, setViewContents] = useState(startOpen);
  const [isMounted, setIsMounted] = useState(false);
  const { watchProviders } = useMovieWatchProviders(movieId);
  const { colors } = useCustomTheme();
  const streamProviders = watchProviders.find((el) => el.type === "stream");
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff85",
        borderTopColor: "#777",
        borderBottomColor: "#777",
        borderBottomWidth: StyleSheet.hairlineWidth, //viewContents ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
        borderTopWidth: StyleSheet.hairlineWidth,
      }}
    >
      <View className="flex-row items-center w-full ">
        <View className="flex-row justify-start flex-1">
          <Pressable
            style={({ pressed }) => [
              {
                // flex: 1,
                // borderBottomColor: "#777",
                // borderBottomWidth: 1,
                // backgroundColor: "#ffffff77",
                opacity: pressed ? 0.6 : 1,
              },
            ]}
            className="py-2 flex-1"
            onPress={() => setViewContents((prev) => !prev)}
          >
            <View className="pl-4">
              <Text style={{ fontSize: 20, fontWeight: "bold", marginRight: 15 }}>{title}</Text>
            </View>
          </Pressable>
        </View>
        {streamProviders?.providers && streamProviders?.providers.length > 0 && (
          <View style={{ maxWidth: 140 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 8,
              }}
              contentContainerStyle={{
                paddingVertical: 5,
                paddingHorizontal: 5,
                backgroundColor: colors.card,
              }}
            >
              {streamProviders?.providers &&
                streamProviders?.providers.map((el) => (
                  <View key={el.providerId} style={{ marginHorizontal: 3 }}>
                    {el?.logoURL && (
                      <Image
                        source={{ uri: el.logoURL }}
                        style={{ width: 25, height: 25, borderRadius: 4 }}
                      />
                    )}
                  </View>
                ))}
            </ScrollView>
          </View>
        )}
        {/* <View className="flex-row justify-end flex-1"> */}
        <Pressable
          style={({ pressed }) => [
            {
              height: "100%",
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          className="py-2 pl-4"
          onPress={() => setViewContents((prev) => !prev)}
        >
          <View className="pr-4">
            <MotiView
              key="1"
              from={{ transform: [{ rotateZ: !isMounted || viewContents ? "0deg" : "180deg" }] }}
              animate={{
                transform: [{ rotateZ: !isMounted || viewContents ? "180deg" : "0deg" }],
              }}
            >
              <ExpandDownIcon size={20} />
            </MotiView>
          </View>
        </Pressable>
        {/* </View> */}
      </View>

      <MotiView
        from={{ height: !isMounted || viewContents ? 0 : height }}
        animate={{ height: !isMounted || viewContents ? height : 0 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <AnimatePresence>
          {viewContents && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={1}>
              {children}
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </View>
  );
};

export default HiddenContainerWatchProviders;

const styles = StyleSheet.create({});
