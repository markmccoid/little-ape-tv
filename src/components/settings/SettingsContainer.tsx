import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
// import { List, FormItem, Section, Link } from '~/components/expo-router-forms/ui/Form';
import * as Form from '~/components/expo-router-forms/ui/Form';
import { IconSymbol } from '../expo-router-forms/ui/IconSymbol.ios';
import * as AC from '@bacons/apple-colors';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';

const SettingsContainer = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();
  const showImages = use$(settings$.showImageInEpisode);
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
      <Pressable
        onPress={() => router.push('/(authed)/settings/tagsetup')}
        className="mx-2 mt-2 flex-row items-center justify-between rounded-lg border-hairline p-1 pl-2 active:bg-card"
        style={{ backgroundColor: `${colors.card}99` }}>
        <Text className="p-1 text-lg">Show Images on Episode List</Text>
        <Switch
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          trackColor={{ false: '#767577', true: '#34C759' }}
          thumbColor={showImages ? '#FFFFFF' : '#F2F2F2'}
          ios_backgroundColor="#767577"
          onValueChange={() => settings$.showImageInEpisode.set((prev) => !prev)}
          value={showImages}
        />
      </Pressable>
    </ScrollView>
  );
};

export default SettingsContainer;
