import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { SymbolView } from 'expo-symbols';
import { savedShows$ } from '~/store/store-shows';

const DeleteShowButton = ({ showId }: { showId: string }) => {
  return (
    <Pressable onPress={() => savedShows$.removeShow(showId)}>
      <SymbolView name="trash.circle.fill" tintColor="red" size={35} />
    </Pressable>
  );
};

export default DeleteShowButton;
