import React, { useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
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
    <TouchableOpacity
      disabled={isProcessing}
      onPress={handleAdd}
      className={`mr-[-10] flex flex-row items-center px-2 pl-1 ${
        isProcessing ? 'opacity-50' : ''
      }`}>
      <SymbolView name="plus.app" tintColor={colors.text} size={30} />
    </TouchableOpacity>
  );
};

export default ShowButtonAdd;
