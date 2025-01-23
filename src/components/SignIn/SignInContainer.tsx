import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '~/authentication/AuthProvider';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tags$ } from '~/store/store-tags';
import { use$ } from '@legendapp/state/react';

const SignInContainer = () => {
  const [newUser, setNewUser] = useState('');
  const auth = useAuth();
  const { top, bottom } = useSafeAreaInsets();
  const tags = use$(tags$.allTags);

  return (
    <ScrollView className="flex-1 p-2" style={{ paddingTop: top }}>
      <Text className="text-lg">Sign In</Text>
      <View className="my-3">
        <TextInput
          value={newUser}
          onChangeText={(el) => setNewUser(el)}
          className="border bg-yellow-600 p-1"
        />
        <Pressable onPress={() => auth.register(newUser)}>
          <Text>Add User</Text>
        </Pressable>

        <Pressable onPress={() => tags$.allTags.set([])} className="border bg-yellow-300 p-1">
          <Text>Clear Tags</Text>
        </Pressable>

        <View className="my-2">
          {auth.allUsers.map((user) => (
            <View key={user.id} className="align-center w-[75%] flex-row justify-between gap-2">
              <Text
                className="w-[50] p-1"
                style={{ color: auth.currentUser?.name === user.name ? 'red' : 'black' }}>
                {user.name}
              </Text>
              <Pressable onPress={() => auth.removeUser(user)} className="border bg-white p-1">
                <Text>Remove</Text>
              </Pressable>
              <Pressable onPress={() => auth.login(user)} className="border bg-white p-1">
                <Text>LogIn</Text>
              </Pressable>
              <Pressable onPress={() => auth.logout()} className="border bg-white p-1">
                <Text>LogOut</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
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
    </ScrollView>
  );
};

export default SignInContainer;
