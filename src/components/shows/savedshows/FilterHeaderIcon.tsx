import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link, useRouter } from 'expo-router';
import { FilterIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';

const FilterHeaderIcon = () => {
  const { colors } = useCustomTheme();
  const router = useRouter();
  const {
    filterIsAllWatched = 'off',
    excludeGenres,
    excludeTags,
    filterIsFavorited = 'off',
    includeTags,
    includeGenres,
    includeWatchProviders,
  } = use$(filterCriteria$.baseFilters);

  const watchedOn = filterIsAllWatched !== 'off' ? 1 : 0;
  const favedOn = filterIsFavorited !== 'off' ? 1 : 0;

  return (
    <Pressable
      className="mr-[5] h-[40] w-[40] items-center justify-center"
      onLongPress={filterCriteria$.actionClearAllCriteria}
      onPress={() => router.push('./filtermodal')}
      hitSlop={15}>
      {({ pressed }) => (
        <>
          <FilterIcon size={25} color={colors.primary} style={{ opacity: pressed ? 0.8 : 1 }} />
          {(!!includeTags?.length || !!excludeTags?.length) && (
            <View className="absolute left-[-2] top-[0] h-[15] w-[15] flex-row justify-center rounded-full bg-green-600">
              <Text className="text-xs color-white">
                {(includeTags?.length || 0) + (excludeTags?.length || 0)}
              </Text>
            </View>
          )}
          {(!!includeGenres?.length || !!excludeGenres?.length) && (
            <View className="absolute right-[-2] top-[0] h-[15] w-[15] flex-row justify-center rounded-full bg-red-600">
              <Text className="text-xs color-white">
                {(includeGenres?.length || 0) + (excludeGenres?.length || 0)}
              </Text>
            </View>
          )}
          {!!(watchedOn + favedOn) && (
            <View className="absolute bottom-[0] right-[1] h-[15] w-[15] flex-row justify-center rounded-full bg-orange-600">
              <Text className="text-xs color-white">{watchedOn + favedOn}</Text>
            </View>
          )}
          {!!includeWatchProviders?.length && (
            <View className="absolute bottom-[0] left-[2] h-[15] w-[15] flex-row justify-center rounded-full bg-blue-600">
              <Text className="text-xs color-white">{includeWatchProviders.length}</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
};

export default FilterHeaderIcon;
