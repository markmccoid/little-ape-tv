import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$, SavedFilter } from '~/store/store-filterCriteria';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import Sortable, { SortableGridRenderItem } from 'react-native-sortables';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NOTE: This is the list of created filters.
// The "Favorite" this is referring to is the indentifier that says to
// show a filter on the main page.
// If you need to edit the actual filters start with "AddEditFilter.tsx"
const SavedFiltersContainer = () => {
  const { bottom } = useSafeAreaInsets();
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const { colors } = useCustomTheme();
  const savedFilters = use$(filterCriteria$.savedFilters);
  const router = useRouter();

  const handleDeleteFilter = (filterId: string) => {
    filterCriteria$.deleteSavedFilter(filterId);
  };
  const handleFavorite = (filterId: string) => {
    filterCriteria$.toggleFavoriteSavedFilter(filterId);
  };
  //# RENDER ITEM for Saved Filters SortableGrid
  const renderItem = ({ item: filter }: { item: SavedFilter }) => {
    return (
      <View
        key={filter.id}
        className="flex-row items-center justify-between border bg-white p-2 dark:bg-slate-600">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable onPress={() => handleFavorite(filter.id)}>
            {filter.favorite ? (
              <SymbolView name="heart" />
            ) : (
              <SymbolView name="heart.fill" tintColor={colors.deleteRed} />
            )}
          </Pressable>
          <Pressable onPress={() => filterCriteria$.applySavedFilter(filter.id)}>
            <Text className="text-xl font-semibold text-text">{filter.name}</Text>
          </Pressable>
        </View>
        <View className="flex-1">
          {filter.loadOnStartup && (
            <SymbolView name="slider.horizontal.3" tintColor={colors.primary} />
          )}
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => handleDeleteFilter(filter.id)}
            className="mr-2 rounded-lg border-hairline bg-button px-2 py-2">
            <SymbolView name="trash" tintColor={colors.deleteRed} />
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(authed)/settings/addeditfiltermodal',
                params: { filterId: filter.id },
              })
            }
            className="mr-2 rounded-lg border-hairline bg-button px-2 py-2">
            <SymbolView name="pencil" tintColor={colors.buttontext} />
          </Pressable>
        </View>
      </View>
    );
  };
  return (
    <View className="flex-1">
      <View className="mx-3 my-2 flex-row justify-end">
        <Pressable
          onPress={() => router.push({ pathname: '/(authed)/settings/addeditfiltermodal' })}
          className="rounded-lg border-hairline bg-button px-3 py-2">
          <Text className="text-button-text font-semibold">Add</Text>
        </Pressable>
      </View>
      <Animated.ScrollView
        contentContainerClassName="p-2"
        ref={scrollableRef}
        style={{ marginBottom: bottom }}>
        <Sortable.Grid
          data={savedFilters}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          rowGap={3}
          // columnGap={10}
          onDragEnd={(parms) => filterCriteria$.updateSavedFilterPositions(parms.indexToKey)}
          enableActiveItemSnap={false}
          activeItemScale={0.95}
          // showDropIndicator
          // itemEntering={BounceInRight}
          scrollableRef={scrollableRef}
          hapticsEnabled={true}
        />
      </Animated.ScrollView>
    </View>
  );
};

export default SavedFiltersContainer;
