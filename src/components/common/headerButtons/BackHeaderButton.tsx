import { View, Text, Pressable } from 'react-native';
import React from 'react';

import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

const BackHeaderButton = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();
  return (
    <Pressable onPress={router.back} className="ml-[-20] h-full flex-row items-center px-2 py-2">
      <SymbolView name="chevron.left" size={22} tintColor={colors.primary} weight="medium" />
      <Text className="pl-1 text-xl" style={{ color: colors.primary }}>
        Back
      </Text>
    </Pressable>
  );
};

export default BackHeaderButton;
