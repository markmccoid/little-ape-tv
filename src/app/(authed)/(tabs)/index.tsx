import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '~/authentication/AuthProvider';
import { use$ } from '@legendapp/state/react';
import { tags$ } from '~/store/store-tags';
import { shows$ } from '~/store/store-shows';
import { useEffect, useState } from 'react';

export default function Home() {
  const tags = use$(tags$.allTags);
  const [tagin, setTagin] = useState('');
  const [showIn, setShowIn] = useState('');
  const { currentUser, logout } = useAuth();
  const shows = use$(shows$.shows);

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

      <View>
        <Text>Shows</Text>
        {shows &&
          shows.map((el) => {
            return (
              <View key={el.showId} className="flex-row items-center gap-4">
                <Text className="text-lg color-black">{el.name}</Text>

                <Pressable onPress={() => shows$.removeShow(el.showId)}>
                  <Text>RT</Text>
                </Pressable>
              </View>
            );
          })}
      </View>
      <View className="flex-col">
        <TextInput
          value={showIn}
          onChangeText={(text) => setShowIn(text)}
          className="mx-2 border bg-white p-1"
        />
        <View className="flex-row justify-start  p-1">
          <Pressable
            onPress={() => shows$.addShow(showIn, showIn, [])}
            className="border bg-slate-500 p-1">
            <Text className="text-white">Submit Show</Text>
          </Pressable>
        </View>
      </View>

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
