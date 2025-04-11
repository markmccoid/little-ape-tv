import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { savedShows$ } from '~/store/store-shows';
import DetailHeader from '~/components/shows/details/DetailHeader';

const ShowIdHome = () => {
  const { showid } = useLocalSearchParams();
  const [shouldRender, setShouldRender] = React.useState(false);
  // const router = useRouter();
  const navigation = useNavigation();
  const show = savedShows$.shows[showid as string].get();
  useEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: show?.name || '',
    };
    navigation.setOptions(options);
    requestAnimationFrame(() => {
      setShouldRender(true);
    });
  }, []);

  return (
    <View className="flex-1">
      {shouldRender && <ShowDetailContainer key={showid as string} showId={showid as string} />}
    </View>
  );
};

export default ShowIdHome;
