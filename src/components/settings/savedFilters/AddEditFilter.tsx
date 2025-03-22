import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { use$ } from '@legendapp/state/react';
import AddEditFilterTags from './AddEditFilterTags';
import { useTagManagement } from './useTagManagement';
import { filterCriteria$, InclusionState, SavedFilter } from '~/store/store-filterCriteria';
import AddEditFilterGenres from './AddEditFilterGenres';
import AddEditSort from './AddEditSort';
import { useSavedFilterSort } from './useSavedFilterSort';
import uuid from 'react-native-uuid';
import { useNavigation, useRouter } from 'expo-router';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import AddEditFavorites from './AddEditFavorites';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import TransparentBackground from '~/components/common/TransparentBackground';
import { ScrollView } from 'react-native-gesture-handler';
import Checkbox from 'expo-checkbox';
import * as Burnt from 'burnt';

type Props = {
  filterId?: string;
};
const AddEditFilter = ({ filterId }: Props) => {
  const navigation = useNavigation();
  const { colors } = useCustomTheme();

  const router = useRouter();
  const savedFilter = use$(() =>
    filterCriteria$.savedFilters.peek().find((el) => el.id === filterId)
  );
  //# --- Saved Filter Name
  const [filterName, setFilterName] = useState(savedFilter?.name || '');
  //# --- Base Filter Info
  const { state: stateArrays, ...tagFunctions } = useTagManagement({
    includedTags: savedFilter?.filter?.includeTags,
    excludedTags: savedFilter?.filter?.excludeTags,
  });
  //~ get any genres if editing
  //~ YES, poorly named, but useTagManagement works for both tags and genres
  const { state: genreStateArrays, ...genreFunctions } = useTagManagement({
    includedTags: savedFilter?.filter?.includeGenres,
    excludedTags: savedFilter?.filter?.excludeGenres,
  });
  //~ Favorited
  const [isFav, setIsFav] = useState<InclusionState>(
    savedFilter?.filter?.filterIsFavorited || 'off'
  );
  const setFavorite = (inclusionState: InclusionState) => {
    setIsFav(inclusionState);
  };

  //~ Load on Startup
  const [loadOnStartup, setLoadonStartup] = useState(savedFilter?.loadOnStartup || false);
  //# --- Sort Info
  const sortFields = savedFilter?.sort;
  const { workingSortFields, savedSortReorder, updateSortDirection, updateActiveFlag } =
    useSavedFilterSort(sortFields);

  //# Save Filter Call
  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      Alert.alert('Error', 'You Must Enter a Filter Name');
      return;
    }

    const newFilter: SavedFilter = {
      id: savedFilter?.id || uuid.v4(),
      name: filterName,
      position: savedFilter?.position || 0,
      filter: {
        excludeTags: stateArrays.excludedTags,
        includeTags: stateArrays.includedTags,
        excludeGenres: genreStateArrays.excludedTags,
        includeGenres: genreStateArrays.includedTags,
        filterIsFavorited: isFav,
      },
      sort: workingSortFields,
      favorite: savedFilter?.favorite || false,
      loadOnStartup,
    };
    filterCriteria$.saveFilter(newFilter);

    router.dismiss();
  };

  //# Set Header Icons
  React.useEffect(() => {
    const options: NativeStackNavigationOptions = {
      headerRight: () => (
        <Pressable onPress={handleSaveFilter} className=" p-2">
          <SymbolView name="square.and.arrow.down" tintColor={colors.primary} size={30} />
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable onPress={() => router.dismiss()} className="ml-[-10] p-2">
          <SymbolView name="x.square.fill" tintColor={colors.primary} size={30} />
        </Pressable>
      ),
    };
    navigation.setOptions(options);
  }, [handleSaveFilter]);

  return (
    <ScrollView>
      <View className="mx-3 my-2 flex-row items-center">
        <Text className="text-lg">Filter Name</Text>
        <TextInput
          value={filterName}
          onChangeText={setFilterName}
          className="mx-3 flex-1 rounded-md border-hairline bg-white p-2"
          placeholder="Filter Name"
        />
        <Checkbox
          style={{ margin: 8 }}
          value={loadOnStartup}
          onValueChange={(val) => {
            setLoadonStartup(val);

            Burnt.toast({
              title: `Startup Filter ${val ? ' SET' : ' REMOVED'}`,
              preset: 'done',
              message: `Filter to Run on Startup ${val ? 'SET' : 'REMOVED'}`,
              shouldDismissByDrag: true,
              duration: 1,
            });
          }}
          color={loadOnStartup ? colors.primary : undefined}
        />
      </View>
      <View className="m-1">
        <AddEditFavorites isFavorited={isFav} setFavorite={setFavorite} />
      </View>

      <View className="m-1 p-1">
        <TransparentBackground />
        <Text className="px-3 text-lg font-semibold text-text">Tags</Text>
        <AddEditFilterTags tagStateArrays={stateArrays} tagFunctions={tagFunctions} />
      </View>

      <View className="m-1 p-1">
        <TransparentBackground />
        <Text className="px-3 text-lg font-semibold text-text">Genres</Text>
        <AddEditFilterGenres genreStateArrays={genreStateArrays} genreFunctions={genreFunctions} />
      </View>

      <View className="m-1 p-1 pb-5">
        <TransparentBackground />
        <Text className="px-3 text-lg font-semibold text-text">Sort</Text>
        <AddEditSort
          sortFields={workingSortFields}
          updateActiveFlag={updateActiveFlag}
          updateSortDirection={updateSortDirection}
          savedSortReorder={savedSortReorder}
        />
      </View>
      <View className="mx-2 mt-2 flex-row justify-end">
        <Pressable onPress={handleSaveFilter} className=" items-center p-2">
          <SymbolView name="square.and.arrow.down" tintColor={colors.primary} size={35} />
          <Text className="text-text">Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddEditFilter;
