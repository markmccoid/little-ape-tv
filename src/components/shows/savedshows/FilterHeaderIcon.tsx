import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { FilterIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';

const FilterHeaderIcon = () => {
  const { colors } = useCustomTheme();
  const { excludeGenres, excludeTags, filterIsFavorited, includeTags, includeGenres } = use$(
    filterCriteria$.baseFilters
  );

  return (
    <Link href="./filtermodal" asChild>
      <Pressable className="mr-[5]" onLongPress={filterCriteria$.actionClearAllCriteria}>
        {({ pressed }) => (
          <>
            <FilterIcon size={25} color={colors.primary} style={{ opacity: pressed ? 0.5 : 1 }} />
            {!!includeTags?.length && (
              <View className="absolute left-[-5] top-[-5] h-[15] w-[15] flex-row justify-center rounded-full bg-green-600">
                <Text className="text-xs color-white">{includeTags?.length}</Text>
              </View>
            )}
            {!!includeGenres?.length && (
              <View className="absolute right-[-5] top-[-5] h-[15] w-[15] flex-row justify-center rounded-full bg-red-600">
                <Text className="text-xs color-white">{includeGenres?.length}</Text>
              </View>
            )}
          </>
        )}
      </Pressable>
    </Link>
  );
};

export default FilterHeaderIcon;
