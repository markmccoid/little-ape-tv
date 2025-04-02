import { View, Text } from 'react-native';
import React from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

const ShowIdHome = () => {
  const { showid } = useLocalSearchParams();

  // const router = useRouter();
  // const navigation = useNavigation();
  // const show = savedShows$.shows[showid as string].get();

  return (
    <View className="flex-1">
      {/* <Text>OUTSIDE ShowIdHome - {show.name}</Text> */}
      {/* <Link href={{ pathname: '/[showid]', params: { showid: '194583' } }} push>
        <Text>GO TO 194583</Text>
      </Link> */}

      <ShowDetailContainer key={showid as string} showId={showid as string} />
    </View>
  );
};

export default ShowIdHome;
