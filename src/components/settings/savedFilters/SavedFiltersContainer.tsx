import { View, Text, Pressable, Platform, Alert } from 'react-native';
import React from 'react';
import * as Haptics from 'expo-haptics';
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

  const handleDeleteFilter = (filterId: string, filterName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Filter', `Are you sure you want to delete "${filterName}"?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          filterCriteria$.deleteSavedFilter(filterId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleFavorite = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    filterCriteria$.toggleFavoriteSavedFilter(filterId);
  };
  //# RENDER ITEM for Saved Filters SortableGrid
  const renderItem = ({ item: filter }: { item: SavedFilter }) => {
    return (
      <View
        key={filter.id}
        className="mb-2 overflow-hidden rounded-lg border-hairline bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <View className="flex-row items-center justify-between">
          {/* Left side - Favorite and Name */}
          <View className="flex-1 flex-row items-center gap-3">
            <Pressable
              onPress={() => handleFavorite(filter.id)}
              className="rounded-full border-hairline p-1.5 active:opacity-70"
              style={{ backgroundColor: colors.primary + '10', borderColor: colors.border }}
              accessibilityLabel={filter.favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <SymbolView
                name={filter.favorite ? 'star.fill' : 'star'}
                tintColor={colors.primary}
                size={20}
              />
            </Pressable>
            <Pressable
              className="px-2"
              hitSlop={10}
              onPress={() => {
                Alert.alert('Apply Filter', `Apply "${filter.name}" filter?`, [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Apply',
                    style: 'default',
                    onPress: () => {
                      filterCriteria$.applySavedFilter(filter.id);
                      // Navigate back to home
                      router.dismissTo('/');
                    },
                  },
                ]);
              }}>
              <Text className="text-lg font-medium text-text dark:text-white" numberOfLines={1}>
                {filter.name}
              </Text>
            </Pressable>
          </View>

          {/* Right side - Actions */}
          <View className="flex-row items-center gap-2">
            {filter.loadOnStartup && (
              <View className="bg-primary/10 rounded-full p-1.5">
                <SymbolView
                  name="checkmark"
                  tintColor={colors.primary}
                  size={16}
                  accessibilityLabel="Loads on startup"
                />
              </View>
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: '/(authed)/settings/addeditfiltermodal',
                  params: { filterId: filter.id },
                });
              }}
              className="rounded-full border-hairline p-2 active:opacity-70"
              style={{
                backgroundColor: colors.primary + '10',
                borderColor: colors.border,
              }}
              accessibilityLabel="Edit filter">
              <SymbolView name="pencil" tintColor={colors.primary} size={18} />
            </Pressable>
            <Pressable
              onPress={() => handleDeleteFilter(filter.id, filter.name)}
              className="rounded-full border-hairline p-2 active:opacity-70"
              style={{
                backgroundColor: colors.deleteRed + '10',
                borderColor: colors.border,
              }}
              accessibilityLabel="Delete filter">
              <SymbolView name="trash" tintColor={colors.deleteRed} size={18} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View className="flex-1">
      <View className="mx-3 my-2 flex-row justify-end">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: '/(authed)/settings/addeditfiltermodal' });
          }}
          className="flex-row items-center rounded-full border-hairline px-4 py-2.5 active:opacity-80"
          style={{
            backgroundColor: colors.primary + '44',
            borderColor: colors.primary,
          }}
          accessibilityLabel="Add new filter">
          <SymbolView name="plus" tintColor={colors.primary} size={16} style={{ marginRight: 6 }} />
          <Text className="font-medium text-primary">Add Filter</Text>
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
