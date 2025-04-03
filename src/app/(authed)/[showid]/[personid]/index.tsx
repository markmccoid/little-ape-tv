import { View, Text } from 'react-native';
import React from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import PersonContainer from '~/components/shows/details/personDetails/PersonContainer';

const PersonIdRoute = () => {
  const { personid, showid } = useLocalSearchParams();

  return (
    <View className="flex-1">
      <PersonContainer personId={personid as string} currentShowId={showid as string} />
    </View>
  );
};

export default PersonIdRoute;
