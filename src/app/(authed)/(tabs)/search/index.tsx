import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import SearchContainer from '~/components/search/SearchContainer';

export default function SearchRoute() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Add Show' }} />
      <SearchContainer />
    </View>
  );
}
