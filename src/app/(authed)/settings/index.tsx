import { Link, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import SettingsContainer from '~/components/settings/SettingsContainer';
import SettingsMock from '~/components/settings/SettingsMock';

export default function Settings() {
  const navigation = useNavigation();
  useEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: 'Settings',
    };
    navigation.setOptions(options);
  }, []);

  return <SettingsContainer />;
  return <SettingsMock />;
}
