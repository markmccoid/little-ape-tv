import { use$ } from '@legendapp/state/react';
import { ScrollView } from 'moti';
import React from 'react';
import { useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';
import { SavedStreamingProviderInfo, settings$ } from '~/store/store-settings';
import { Image } from 'expo-image';
import SPSettingsContainer from '~/components/settings/streamingProviders/SPSettingsContainer';

const StreamingProviderSetup = () => {
  return <SPSettingsContainer />;
};

export default StreamingProviderSetup;
