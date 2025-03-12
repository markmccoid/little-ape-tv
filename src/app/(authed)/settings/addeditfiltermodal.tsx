import { View, Text } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import AddEditFilter from '~/components/settings/savedFilters/AddEditFilter';

const AddEditFilterModal = () => {
  const navigation = useNavigation();
  const { filterId } = useLocalSearchParams<{ filterId: string }>();

  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      headerShown: true,
      title: filterId ? 'Edit Filter' : 'Add New Filter',
    };
    // requestAnimationFrame(() => {
    navigation.setOptions(options);
    // });
  }, []);

  return <AddEditFilter filterId={filterId} />;
};

export default AddEditFilterModal;
