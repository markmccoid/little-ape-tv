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
import { useRouter } from 'expo-router';
import AddEditFavorites from './AddEditFavorites';

type Props = {
  filterId?: string;
};
const AddEditFilter = ({ filterId }: Props) => {
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
    };
    filterCriteria$.saveFilter(newFilter);
    router.dismiss();
  };
  return (
    <View>
      <View className="mx-3 my-2 flex-row items-center">
        <Text className="text-lg">Filter Name</Text>
        <TextInput
          value={filterName}
          onChangeText={setFilterName}
          className="mx-3 flex-1 rounded-md border-hairline bg-white p-2"
          placeholder="Filter Name"
        />
      </View>
      <AddEditFavorites isFavorited={isFav} setFavorite={setFavorite} />
      <AddEditFilterTags tagStateArrays={stateArrays} tagFunctions={tagFunctions} />
      <AddEditFilterGenres genreStateArrays={genreStateArrays} genreFunctions={genreFunctions} />
      <AddEditSort
        sortFields={workingSortFields}
        updateActiveFlag={updateActiveFlag}
        updateSortDirection={updateSortDirection}
        savedSortReorder={savedSortReorder}
      />
      <Pressable onPress={handleSaveFilter} className="border bg-button p-2">
        <Text className="text-buttontext">Save Filter</Text>
      </Pressable>
    </View>
  );
};

export default AddEditFilter;
