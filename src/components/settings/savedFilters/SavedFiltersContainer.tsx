import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { useRouter } from 'expo-router';

const SavedFiltersContainer = () => {
  const savedFilters = use$(filterCriteria$.savedFilters);
  const router = useRouter();

  console.log('SAVED FILTERS', savedFilters);
  return (
    <View className="flex-1">
      <View className="mx-3 mt-2 flex-row justify-end">
        <Pressable
          onPress={() => router.push({ pathname: '/(authed)/settings/addeditfiltermodal' })}
          className="rounded-lg border-hairline bg-button px-3 py-2">
          <Text className="text-button-text font-semibold">Add</Text>
        </Pressable>
      </View>
      <View>
        {savedFilters?.map((filter) => {
          return (
            <Pressable>
              <Text>{filter.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SavedFiltersContainer;
