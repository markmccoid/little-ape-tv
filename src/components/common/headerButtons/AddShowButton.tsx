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
      className={`mr-[-10] flex flex-row items-center px-2 pl-1 ${
        isProcessing ? 'opacity-50' : ''
      } active:scale-95 `}>
      <SymbolView name="plus.app" tintColor={colors.text} size={30} />
    </Pressable>
  );
};

export default ShowButtonAdd;
