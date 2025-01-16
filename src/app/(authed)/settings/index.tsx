import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const router = useRouter();
  return (
    <View className="flex-1 p-2">
      <Pressable className="border bg-white" onPress={() => router.back()}>
        <Text className="text-lg">Go To Home</Text>
      </Pressable>
      <Pressable
        className="border bg-white"
        onPress={() => router.push('/(authed)/settings/page2')}>
        <Text className="text-lg">Go To page2</Text>
      </Pressable>
    </View>
  );
}
