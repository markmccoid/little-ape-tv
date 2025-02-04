import React from "react";
import { View, StyleProp, TextStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCustomTheme } from "@/lib/colorThemes";

type DragHandleIconProps = {
  size: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};
const DragHandleIcon = ({ size, color, style }: DragHandleIconProps) => {
  return <MaterialIcons name="drag-handle" size={size} color={color} style={style} />;
};

const DefaultHandle: React.FC = () => {
  const { colors } = useCustomTheme();

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        borderRightWidth: 1,
        borderRightColor: "#aaa",
        borderBottomWidth: 0.5,
        borderBottomColor: "#aaa",
        borderTopWidth: 0.5,
        borderTopColor: "#aaa",
        height: "100%",
        backgroundColor: colors.card,
        justifyContent: "center",
        paddingHorizontal: 5,
      }}
    >
      <DragHandleIcon size={25} color={colors.cardForeground} />
    </View>
  );
};

export default DefaultHandle;
