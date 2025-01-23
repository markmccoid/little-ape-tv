import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '~/authentication/AuthProvider';
import { use$ } from '@legendapp/state/react';
import { tags$ } from '~/store/store-tags';
import { useState } from 'react';

export default function Home() {
  const tags = use$(tags$.allTags);
  const [tagin, setTagin] = useState('');
  const { currentUser, logout } = useAuth();

  // if (!tags) return null;
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <TextInput
        value={tagin}
        onChangeText={(text) => setTagin(text)}
        className="border bg-white p-1"
      />

      <Pressable
        onPress={() => {
          console.log('Adding tag', tagin);
          tags$.addTag(tagin);
        }}
        className="rounder-lg border bg-yellow-200 p-1">
        <Text>Add Tag Function</Text>
      </Pressable>
      {tags &&
        tags.map((el) => {
          return (
            <View key={el.id} className="flex-row items-center gap-4">
              <Text className="text-lg color-black">{el.name}</Text>

              <Pressable onPress={() => tags$.removeTag(el.id)}>
                <Text>RT</Text>
              </Pressable>
            </View>
          );
        })}

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
