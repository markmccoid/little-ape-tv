import { View, Text, TextInput } from 'react-native';
import React, { useState } from 'react';
import { use$ } from '@legendapp/state/react';
import { tags$ } from '~/store/store-shows';
import AddEditFilterTags from './AddEditFilterTags';
import { useTagManagement } from './useTagManagement';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import AddEditFilterGenres from './AddEditFilterGenres';

type Props = {
  filterId?: string;
};
const AddEditFilter = ({ filterId }: Props) => {
  const savedFilters = use$(() =>
    filterCriteria$.savedFilters.peek().find((el) => el.id === filterId)
  );
  const includeTags = savedFilters?.filter?.includeTags;
  const excludeTags = savedFilters?.filter?.excludeTags;
  const { state: stateArrays, ...tagFunctions } = useTagManagement({
    includedTags: includeTags,
    excludedTags: excludeTags,
  });
  //~ get any genres if editing
  const includeGenres = savedFilters?.filter?.includeGenres;
  const excludeGenres = savedFilters?.filter?.excludeGenres;
  //~ YES, poorly named, but useTagManagement works for both tags and genres
  const { state: genreStateArrays, ...genreFunctions } = useTagManagement({
    includedTags: includeGenres,
    excludedTags: excludeGenres,
  });

  const [filterName, setFilterName] = useState(savedFilters?.name || '');

  console.log('includes', genreStateArrays.includedTags);
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
      <AddEditFilterTags tagStateArrays={stateArrays} tagFunctions={tagFunctions} />
      <AddEditFilterGenres genreStateArrays={genreStateArrays} genreFunctions={genreFunctions} />
    </View>
  );
};

export default AddEditFilter;
