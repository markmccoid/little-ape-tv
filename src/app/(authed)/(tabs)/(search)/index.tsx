import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import SearchContainer from '~/components/search/SearchContainer';

export default function SearchRoute() {
  return (
    <View className="flex-1">
      {/* adding title so that it shows as the back button descriptor when going to details */}
      <Stack.Screen options={{ title: 'Search' }} />
      <SearchContainer />
    </View>
  );
}
