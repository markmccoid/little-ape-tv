import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
// import { List, FormItem, Section, Link } from '~/components/expo-router-forms/ui/Form';
import * as Form from '~/components/expo-router-forms/ui/Form';
import { IconSymbol } from '../expo-router-forms/ui/IconSymbol.ios';
import * as AC from '@bacons/apple-colors';

const SettingsContainer = () => {
  const router = useRouter();
  return (
    <View className="flex-1">
      <Pressable className="border bg-white" onPress={() => router.back()}>
        <Text className="text-lg">Go To Home</Text>
      </Pressable>
      <View style={{ backgroundColor: 'blue', padding: 10, margin: 10 }}>
        <Pressable
          onPress={() => router.push('/(authed)/settings/page2')}
          className="bg-white p-1 active:bg-red-500">
          <Text className="p-1 text-lg">Go To page2</Text>
        </Pressable>
      </View>
      <Form.List navigationTitle="Settings" style={{ backgroundColor: AC.quaternarySystemFill }}>
        <Form.Section
          title="Tags"
          footer="This is the footer"
          style={{ backgroundColor: AC.systemFill }}>
          <Form.HStack>
            <Pressable
              onPress={() => router.push('/(authed)/settings/page2')}
              className="flex-row justify-end ">
              <IconSymbol name="tag.fill" color={AC.label} />
              <Form.Text>Tags</Form.Text>
              <View style={{ flex: 1 }} />
              <IconSymbol name="chevron.right" color={AC.label} />
            </Pressable>
          </Form.HStack>
          <Form.Text
            // className="border bg-white"
            hint="Enter a tag"
            onPress={() => router.push('/(authed)/settings/page2')}
            systemImage="tag.fill">
            Go To page2
            <IconSymbol name="chevron.right" color={AC.systemGreen} />
          </Form.Text>
        </Form.Section>
      </Form.List>
    </View>
  );
};

export default SettingsContainer;
