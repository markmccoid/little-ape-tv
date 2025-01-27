import { Link, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { AddIcon, ViewTVShowIcon } from '~/components/common/icon';

import { HeaderButton } from '~/components/HeaderButton';
import { TabBarIcon } from '~/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shows',
          tabBarIcon: ({ color }) => <ViewTVShowIcon color={color} size={25} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => {
            return (
              <Link href="/settings">
                <Text>SET</Text>
              </Link>
            );
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Add Show',
          headerShown: false,
          tabBarIcon: ({ color }) => <AddIcon color={color} size={25} />,
        }}
      />
    </Tabs>
  );
}
