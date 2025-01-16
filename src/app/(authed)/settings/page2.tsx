import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Page2() {
  const router = useRouter();
  return (
    <View className="flex-1 p-2">
      <Pressable className="border bg-white" onPress={() => router.back()}>
        <Text className="text-lg">Go back</Text>
      </Pressable>
    </View>
  );
}
