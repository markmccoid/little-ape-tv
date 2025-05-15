import { View, Text, Image as RNImage } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import {
  SavedStreamingProviderInfo,
  settings$,
  WatchProviderAttributes,
} from '~/store/store-settings';
import Sortable from 'react-native-sortables';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { orderBy } from 'lodash';
import { use$ } from '@legendapp/state/react';

type Props = {
  provider: WatchProviderAttributes;
};
const SPSettingsItem = ({ provider }: Props) => {
  const { colors } = useCustomTheme();
  const providers = use$(settings$.watchProviderAttributes);
  //! --------------------
  //! FIX toggle to use new WatchProviderAttributes
  const toggleIsHidden = (providerId: number) => {
    const newProviders = orderBy(providers, ['displayPriority'], ['asc']).map((el, index) => {
      if (el.providerId === providerId) {
        return { ...el, isHidden: !el?.isHidden };
      } else {
        return el;
      }
    });
    // Then, sort the array so hidden providers are at the end
    // and update displayPriority for all providers
    const sortedProviders = [...newProviders].sort((a, b) => {
      if (a.isHidden && !b.isHidden) return 1;
      if (!a.isHidden && b.isHidden) return -1;
      return 0;
    });

    // Update displayPriority to ensure correct numbering
    const updatedProviders = sortedProviders.map((provider, index) => {
      return {
        ...provider,
        displayPriority: index + 1,
      };
    });

    settings$.watchProviderAttributes.set(updatedProviders);
  };
  return (
    <View className="h-[100] items-center justify-start rounded-lg border-hairline border-primary bg-button pt-2">
      <Image source={provider.logoPath} style={{ width: 60, height: 60, borderRadius: 10 }} />
      <View className="absolute bottom-0 m-1 rounded-md border-hairline border-primary">
        <View className="absolute h-full w-full flex-1 rounded-md bg-white opacity-75" />
        <Text numberOfLines={2} className="px-1 pt-1 text-center font-semibold text-buttontext">
          {provider.provider}
        </Text>
      </View>
      <Sortable.Pressable
        onPress={() => toggleIsHidden(provider.providerId)}
        className="absolute right-0 top-0">
        {!provider?.isHidden ? (
          <SymbolView name="eye.circle.fill" type="palette" colors={['white', colors.primary]} />
        ) : (
          <SymbolView name="eye.slash.circle.fill" type="palette" colors={['red', colors.card]} />
        )}
      </Sortable.Pressable>
    </View>
  );
};

export default SPSettingsItem;
