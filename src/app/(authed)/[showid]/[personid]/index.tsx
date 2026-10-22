import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
