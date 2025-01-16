import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function SignIn() {
  return (
    <View className="flex-1 p-2">
      <Text className="text-lg">Sign In</Text>
      <Link href="/" replace asChild>
        <Pressable className="border bg-white">
          <Text className="text-lg">Go To Tabs</Text>
        </Pressable>
      </Link>
      <Link href="/" asChild>
        <Pressable className="border bg-white">
          <Text className="text-lg">Go To Settings</Text>
        </Pressable>
      </Link>
    </View>
  );
}
