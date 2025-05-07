import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import WatchProviderItem from './WatchProviderItem';
import { orderBy, sortBy } from 'lodash';

type Props = {
  activeProviderIds: number[];
  toggleProvider: (providerId: number) => void;
};
const WatchProviderFilterContainer = ({ activeProviderIds = [], toggleProvider }: Props) => {
  const providers = use$(settings$.savedStreamingProviders) || [];
  const taggedProviders = providers
    .map((el) => ({
      ...el,
      active: activeProviderIds.includes(el.providerId),
    }))
    .filter((el) => !el.isHiddenFlag);
  const sortedProviders = orderBy(taggedProviders, ['active', 'displayPriority'], ['desc', 'asc']);

  return (
    <View className="mx-1 flex-row flex-wrap ">
      {sortedProviders.length > 0 &&
        sortedProviders.map((providerObj) => {
          return (
            <WatchProviderItem
              key={providerObj.providerId}
              providerObj={providerObj}
              toggleItem={toggleProvider}
            />
          );
        })}
    </View>
  );
};

export default WatchProviderFilterContainer;
