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
              <Link href="/settings" className="ml-3">
                <SettingsIcon size={25} />
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
