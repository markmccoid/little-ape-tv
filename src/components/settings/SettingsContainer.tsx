import { View, Text, Pressable, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
// import { List, FormItem, Section, Link } from '~/components/expo-router-forms/ui/Form';
import * as Form from '~/components/expo-router-forms/ui/Form';
import { IconSymbol } from '../expo-router-forms/ui/IconSymbol.ios';
import * as AC from '@bacons/apple-colors';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

const SettingsContainer = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();

  return (
    <ScrollView className="flex-1">
      <Text className="mx-3 text-2xl" style={{ color: AC.secondaryLabel }}>
        Settings
      </Text>

      <Pressable
        onPress={() => router.push('/(authed)/settings/tagsetup')}
        className="mx-2 flex-row items-center justify-between rounded-lg border-hairline p-1 px-2 active:bg-card"
        style={{ backgroundColor: `${colors.card}99` }}>
        <Text className="p-1 text-lg">Tags</Text>
        <SymbolView name="chevron.right" tintColor={colors.text} size={20} />
      </Pressable>
    </ScrollView>
  );
};

export default SettingsContainer;
