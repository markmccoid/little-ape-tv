import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '~/authentication/AuthProvider';

import { ScreenContent } from '~/components/ScreenContent';

export default function SignIn() {
  const [newUser, setNewUser] = useState('');
  const auth = useAuth();

  return (
    <View className="flex-1 p-2">
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
        <View className="my-2">
          {auth.allUsers.map((el) => (
            <View key={el.id} className="align-center w-[75%] flex-row justify-between gap-2">
              <Text
                className="w-[50] p-1"
                style={{ color: auth.currentUser?.name === el.name ? 'red' : 'black' }}>
                {el.name}
              </Text>
              <Pressable onPress={() => auth.removeUser(el)} className="border bg-white p-1">
                <Text>Remove</Text>
              </Pressable>
              <Pressable onPress={() => auth.login(el)} className="border bg-white p-1">
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
    </View>
  );
}
