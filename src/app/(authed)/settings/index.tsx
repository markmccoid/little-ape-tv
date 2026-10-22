import { Link, useNavigation, useRouter, type NativeStackNavigationOptions } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SettingsContainer from '~/components/settings/SettingsContainer';

export default function Settings() {
  const navigation = useNavigation();
  useEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: 'Settings',
    };
    navigation.setOptions(options);
  }, []);

  return <SettingsContainer />;
}
