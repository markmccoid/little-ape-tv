import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { FilterIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';

const FilterHeaderIcon = () => {
  const { colors } = useCustomTheme();
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
    <Link href="./filtermodal" asChild>
      <Pressable
        className="mr-[5]"
        onLongPress={filterCriteria$.actionClearAllCriteria}
        hitSlop={5}>
        {({ pressed }) => (
          <>
            <FilterIcon size={25} color={colors.primary} style={{ opacity: pressed ? 0.5 : 1 }} />
            {(!!includeTags?.length || !!excludeTags?.length) && (
              <View className="absolute left-[-5] top-[-5] h-[15] w-[15] flex-row justify-center rounded-full bg-green-600">
                <Text className="text-xs color-white">
                  {(includeTags?.length || 0) + (excludeTags?.length || 0)}
                </Text>
              </View>
            )}
            {(!!includeGenres?.length || !!excludeGenres?.length) && (
              <View className="absolute right-[-5] top-[-5] h-[15] w-[15] flex-row justify-center rounded-full bg-red-600">
                <Text className="text-xs color-white">
                  {(includeGenres?.length || 0) + (excludeGenres?.length || 0)}
                </Text>
              </View>
            )}
            {!!(watchedOn + favedOn) && (
              <View className="absolute bottom-[-5] ml-[15] h-[15] w-[15] flex-row justify-center rounded-full bg-yellow-600">
                <Text className="text-xs color-white">{watchedOn + favedOn}</Text>
              </View>
            )}
            {!!includeWatchProviders?.length && (
              <View className="absolute bottom-[-5] ml-[-5] h-[15] w-[15] flex-row justify-center rounded-full bg-blue-600">
                <Text className="text-xs color-white">{includeWatchProviders.length}</Text>
              </View>
            )}
          </>
        )}
      </Pressable>
    </Link>
  );
};

export default FilterHeaderIcon;
