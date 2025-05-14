import React, { useEffect, useLayoutEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import SPSettingsContainer from '~/components/settings/streamingProviders/SPSettingsContainer';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Link, useNavigation } from 'expo-router';

const WatchProviderSetup = () => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const navigation = useNavigation();
  // const router = useRouter();

  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      headerRight: () => {
        return (
          <Link href={`/settings/addwatchprovider`}>
            <Text>Add Provider</Text>
          </Link>
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
