import { View, Text } from 'react-native';
import React from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import PersonContainer from '~/components/shows/details/personDetails/PersonContainer';

const PersonIdRoute = () => {
  const { personid, showid } = useLocalSearchParams();
  console.log('SHOWID', showid);
  // const router = useRouter();
  // const navigation = useNavigation();
  // const show = savedShows$.shows[showid as string].get();

  return (
    <View className="flex-1">
      <Text>PersonIdRoute - {personid}</Text>
      <PersonContainer personId={personid as string} currentShowId={showid as string} />
      {/* <Link\'
        href={`/(authed)/82782`}
        className="absolute right-10 top-10 rounded-lg bg-blue-500 p-2">
        <Text>Next Show</Text>
      </Link> */}
    </View>
  );
};

export default PersonIdRoute;
