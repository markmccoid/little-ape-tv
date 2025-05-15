import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { SavedStreamingProviderInfo, WatchProviderAttributes } from '~/store/store-settings';
import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';

type Props = {
  providerObj: WatchProviderAttributes & { active: boolean };
  toggleItem: (providerId: number) => void;
};
const WatchProviderItem = ({ providerObj, toggleItem }: Props) => {
  return (
    <Pressable
      key={providerObj.providerId}
      className="m-1 flex-col items-center rounded-lg p-2"
      style={{ borderColor: providerObj.active ? 'red' : 'white', borderWidth: 1 }}
      onPress={() => toggleItem(providerObj.providerId)}>
      {providerObj.active && (
        <View className="absolute right-0 top-0 z-10">
          <SymbolView
            type="palette"
            name="checkmark.square.fill"
            // tintColor="green"
            colors={['white', 'green']}
            size={25}
          />
        </View>
      )}
      <Image
        source={providerObj.logoPath}
        style={{ width: 50, height: 50, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth }}
      />
      {/* <Text>{el.provider}</Text> */}
    </Pressable>
  );
};

export default WatchProviderItem;
