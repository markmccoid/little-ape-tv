import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '~/authentication/AuthProvider';

import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  const { currentUser, logout } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <Pressable onPress={logout}>
          <Text>Log Out {currentUser?.name}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
