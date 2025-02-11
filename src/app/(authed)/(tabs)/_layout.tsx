import { Link, Tabs } from 'expo-router';
import { AddIcon, SettingsIcon, ViewTVShowIcon } from '~/components/common/Icons';

import { HeaderButton } from '~/components/HeaderButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Shows',
          headerShown: false,
          tabBarIcon: ({ color }) => <ViewTVShowIcon color={color} size={25} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: 'Add Show',
          headerShown: false,
          tabBarIcon: ({ color }) => <AddIcon color={color} size={25} />,
        }}
      />
    </Tabs>
  );
}
