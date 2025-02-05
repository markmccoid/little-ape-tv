import { Link, Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import TagContainer from '~/components/settings/tagsetup/TagContainer';

export default function TagSetup() {
  const router = useRouter();
  return (
    <View className="flex-1">
      <TagContainer />
    </View>
  );
}
