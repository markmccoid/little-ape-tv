import { use$ } from '@legendapp/state/react';
import { ScrollView } from 'moti';
import React from 'react';
import { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  SortableGridDragEndCallback,
  SortableGridDragEndParams,
  SortableGridRenderItem,
} from 'react-native-sortables';
import Sortable from 'react-native-sortables';
import { SavedStreamingProviderInfo, settings$ } from '~/store/store-settings';
import { Image } from 'expo-image';
import SPSettingsItem from './SPSettingsItem';

const SPSettingsContainer = () => {
  const providers = use$(settings$.savedStreamingProviders) || [];
  const { bottom } = useSafeAreaInsets();
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();

  const renderItem = useCallback<SortableGridRenderItem<SavedStreamingProviderInfo>>(
    ({ item }) => (
      <Sortable.Handle mode={item?.isHiddenFlag ? 'fixed' : 'draggable'}>
        <SPSettingsItem provider={item} />
      </Sortable.Handle>
    ),
    []
  );

  // Brute force - The data has the whole array in the new order, we don't really need to
  //  but we update the displayPriority to match the order of the array and then
  //  save it to the store
  const updatePositions = (parms: SortableGridDragEndParams<SavedStreamingProviderInfo>) => {
    const newOrder = parms.data.map((el, index) => ({ ...el, displayPriority: index + 1 }));
    settings$.savedStreamingProviders.set(newOrder);
  };
  return (
    <Animated.ScrollView
      contentContainerStyle={{ padding: 10 }}
      ref={scrollableRef}
      style={{ marginBottom: bottom }}>
      <Sortable.Grid
        columns={3}
        customHandle
        data={providers} // Pass your data here
        renderItem={renderItem}
        keyExtractor={(item) => item.providerId.toString()}
        rowGap={10}
        columnGap={10}
        scrollableRef={scrollableRef}
        onDragEnd={(parms) => updatePositions(parms)}
      />
    </Animated.ScrollView>
  );
};

export default SPSettingsContainer;
