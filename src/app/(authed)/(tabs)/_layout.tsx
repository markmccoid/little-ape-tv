import { Link, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddIcon, SettingsIcon, ViewTVShowIcon } from '~/components/common/Icons';

import { QuickFilters } from '~/components/zeego/QuickFilters';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function TabLayout() {
  const { colors } = useCustomTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <View className="flex-1 flex-row justify-center">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
          // tabBarStyle: { position: 'absolute', bottom: 0 },
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
          name="quickfilter"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <SymbolView
                name="line.3.horizontal.circle.fill"
                tintColor={colors.primary}
                size={30}
                style={{ opacity: 0 }}
              />
            ),
            //tabBarStyle: { position: 'absolute', top: 10 },
            tabBarItemStyle: { marginTop: -5 },
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
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
      <View className="absolute flex-1 items-center p-1" style={{ bottom: bottom + 10 }}>
        <QuickFilters />
      </View>
    </View>
  );
}
