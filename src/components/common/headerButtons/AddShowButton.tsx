import React, { useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

type Props = {
  addShow: () => void;
};

const ShowButtonAdd = ({ addShow }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useCustomTheme();

  const handleAdd = () => {
    setIsProcessing(true);
    addShow();
    setIsProcessing(false);
  };

  return (
    <Pressable
      disabled={isProcessing}
      onPress={handleAdd}
      className={`relative mr-[-10] flex flex-row items-center justify-center px-2${
        isProcessing ? 'opacity-50' : ''
      } active:scale-95 `}>
      {/* View is so we have a white BG for the + sign */}
      <View className="absolute h-[20] w-[20]  rounded-full bg-white " />
      <SymbolView name="plus.circle.fill" tintColor={colors.includeGreen} size={35} />
    </Pressable>
  );
};

export default ShowButtonAdd;
