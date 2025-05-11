import { View, Text, Pressable, Modal, StyleSheet, Dimensions, ScrollView } from 'react-native';
import React, { useReducer } from 'react';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

const { width, height } = Dimensions.get('window');
const popUpWidth = width / 1.2;
const popUpHeight = height / 2;

type Props = {
  title?: string;
  infoText?: string;
};
const InfoPopup = ({ title, infoText }: Props) => {
  const [isVisible, toggleIsVisible] = useReducer((el) => !el, false);
  const { colors } = useCustomTheme();
  return (
    <View>
      <Pressable onPress={toggleIsVisible}>
        <SymbolView name="info.circle.fill" tintColor={colors.primary} />
      </Pressable>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View className="h-full items-center justify-center ">
          <Pressable
            onPress={() => {
              toggleIsVisible();
            }}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <View className="rounded-xl bg-white" style={{ width: popUpWidth, height: popUpHeight }}>
            <View className="flex-row items-center justify-between px-3 py-2">
              <Text className="text-xl font-bold">{title}</Text>
              <Pressable onPress={toggleIsVisible} hitSlop={10}>
                <SymbolView name="x.square" tintColor={colors.primary} />
              </Pressable>
            </View>
            <View className="h-[1] w-full bg-black" />
            <ScrollView className="px-3 py-2">
              <Text className="" style={{ fontSize: 16 }}>
                {infoText}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InfoPopup;
