import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation, type NativeStackNavigationOptions } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';
import { getDb } from '~/db/client';
import { selectShow } from '~/db/shows';
import DetailHeader from '~/components/shows/details/DetailHeader';

const ShowIdHome = () => {
  const { showid } = useLocalSearchParams();
  const [shouldRender, setShouldRender] = React.useState(false);
  // const router = useRouter();
  const navigation = useNavigation();
  useEffect(() => {
    const show = selectShow(getDb(), showid as string);
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
