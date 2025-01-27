import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SettingsContainer from '~/components/settings/SettingsContainer';

export default function Settings() {
  const router = useRouter();
  return <SettingsContainer />;
}
