import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '~/authentication/AuthProvider';
import { use$ } from '@legendapp/state/react';

import { savedShows$, tags$ } from '~/store/store-shows';
import { useEffect, useState } from 'react';

export default function Home() {
  const tags = use$(tags$.tagList);
  const [tagin, setTagin] = useState('');
  const [showIn, setShowIn] = useState('');
  const { currentUser, logout } = useAuth();
  const shows = use$(savedShows$.shows);
  console.log(
    'ALL SHOWS',
    Object.keys(shows).map((key) => shows[key].name)
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Shows' }} />
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
        <Pressable
          onPress={logout}
          style={({ pressed }) => {
            console.log('PRESSS', pressed);
            return [{ backgroundColor: pressed ? 'red' : 'white', borderWidth: 1 }];
          }}>
          <Text>Log Out {currentUser?.name}</Text>
        </Pressable>
      </View>
      <View>
        {shows &&
          Object.keys(shows).map((key) => (
            <View key={key}>
              <Text>{shows[key].name}</Text>
              <Pressable
                onPress={() => savedShows$.removeShow(key)}
                className="rounded-md border p-1">
                <Text>Delete</Text>
              </Pressable>
            </View>
          ))}
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
