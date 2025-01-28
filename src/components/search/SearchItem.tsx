import { View, Text, Pressable } from 'react-native';
import React from 'react';

type Props = {
  searchItem: {};
};
const SearchItem = ({ searchItem }: Props) => {
  // console.log('searchItem', searchItem);
  // if (!searchItem) return null;
  return (
    <View>
      <Text key={searchItem.id}>{searchItem.name}</Text>
    </View>
  );
};

export default SearchItem;
