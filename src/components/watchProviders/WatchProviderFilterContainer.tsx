import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';
import WatchProviderItem from './WatchProviderItem';

type Props = {
  activeProviderIds: number[];
  toggleProvider: (providerId: number) => void;
};
const WatchProviderFilterContainer = ({ activeProviderIds = [], toggleProvider }: Props) => {
  const providers = use$(settings$.savedStreamingProviders);

  return (
    <View className="mx-1 flex-row flex-wrap justify-center">
      {providers.length > 0 &&
        providers.map((providerObj) => {
          const active = activeProviderIds.includes(providerObj.providerId);
          return (
            <WatchProviderItem
              key={providerObj.providerId}
              providerObj={providerObj}
              active={active}
              toggleItem={toggleProvider}
            />
          );
        })}
    </View>
  );
};

export default WatchProviderFilterContainer;
