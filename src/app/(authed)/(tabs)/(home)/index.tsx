import { View } from 'react-native';
import ShowsContainer from '~/components/shows/savedshows/ShowsContainer';

export default function ShowHome() {
  return (
    <View className="flex-1">
      <ShowsContainer />
    </View>
  );
}
