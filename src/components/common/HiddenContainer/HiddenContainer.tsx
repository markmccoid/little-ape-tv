import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { CollapseUpIcon, EraserIcon, ExpandDownIcon } from "@/components/common/Icons";
import { useCustomTheme } from "@/lib/colorThemes";

/**
 * Component will take a component as a child and toggle displaying or hiding
 * the content.
 * Will accept a passed "title" prop to display as title
 * Will also accept "startOpen" prop to determine if container is in
 * open state when initially displayed.
 *
 */

const HiddenContainer = ({
  children,
  style,
  title,
  titleInfo,
  leftIconFunction,
  startOpen = false,
}) => {
  const [viewContents, setViewContents] = useState(startOpen);
  const { colors } = useCustomTheme();
  return (
    <View
      style={{
        backgroundColor: "#ffffff85",
        borderTopColor: "#777",
        borderBottomColor: "#aaa",
        borderBottomWidth: viewContents ? 1 : 0,
        borderTopWidth: 1,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: "red",
        flex: 1,
      }}
    >
      <View className="flex-1 flex-row border-b border-gray-600 justify-start items-center pl-[2]">
        {leftIconFunction && (
          <Pressable onPress={leftIconFunction}>
            <EraserIcon color={!!titleInfo ? colors.deleteRed : "black"} />
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            {
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 5,
              // borderBottomColor: "#777",
              // borderBottomWidth: 1,
              // backgroundColor: "#ffffff77",
              opacity: pressed ? 0.6 : 1,
              paddingHorizontal: 20,
              paddingLeft: 5,
              borderWidth: 2,
              borderColor: "blue",
              flex: 1,
            },
          ]}
          onPress={() => setViewContents((prev) => !prev)}
        >
          <View className="flex-row justify-between items-center flex-1 ">
            <View
              style={{
                paddingRight: 5,
                width: "25%",
              }}
            >
              <Text
                style={{ flex: 1, fontSize: 18, fontWeight: "bold", borderWidth: 1 }}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingRight: 5,
                flex: 1,
              }}
            >
              <Text className="flex-1" numberOfLines={1} lineBreakMode="tail">
                {titleInfo}
              </Text>
            </View>
          </View>
          <View className="">
            {!viewContents ? (
              <ExpandDownIcon style={{ marginTop: 5 }} size={18} />
            ) : (
              <CollapseUpIcon style={{ marginTop: 5 }} size={18} />
            )}
          </View>
        </Pressable>
      </View>
      {viewContents && <View style={{ ...style }}>{children}</View>}
    </View>
  );
};

export default HiddenContainer;

const styles = StyleSheet.create({});
