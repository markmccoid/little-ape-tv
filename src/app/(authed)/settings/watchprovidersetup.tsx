import React, { useEffect, useLayoutEffect } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import SPSettingsContainer from '~/components/settings/streamingProviders/SPSettingsContainer';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Link, useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const WatchProviderSetup = () => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      headerRight: () => {
        return (
          <Pressable className="" onPress={() => router.push('/settings/addwatchprovider')}>
            <SymbolView name="minus.plus.batteryblock.stack" size={35} />
          </Pressable>
        );
      },
    };
    navigation.setOptions(options);
  }, []);
  useEffect(() => {
    requestAnimationFrame(() => {
      setShouldRender(true);
    });
  }, []);

  return <View className="flex-1">{shouldRender && <SPSettingsContainer />}</View>;
};

export default WatchProviderSetup;
