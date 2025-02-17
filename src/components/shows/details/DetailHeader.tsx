import { View, Dimensions } from 'react-native';
import React from 'react';
import { SavedShow } from '~/store/functions-shows';
import { TVShowDetails } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');
type Props = {
  showData: (Partial<SavedShow> & Partial<TVShowDetails>) | undefined;
};
const DetailHeader = ({ showData }: Props) => {
  return (
    <View className="flex-row overflow-hidden rounded-xl border">
      <Image
        source={showData?.posterURL}
        style={{ width: width / 2.3, height: (width / 2.3) * 1.5 }}
      />
    </View>
  );
};

export default DetailHeader;
