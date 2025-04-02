import { View, Text } from 'react-native';
import React from 'react';
import { getPersonDetails_typedef } from '@markmccoid/tmdb_api';
import ShowImage from '~/components/common/ShowImage';

type Props = {
  personInfo: getPersonDetails_typedef['data'];
};
const PersonProfile = ({ personInfo }: Props) => {
  return (
    <View>
      <ShowImage posterURL={personInfo.profileImage} imageWidth={125} />
    </View>
  );
};

export default PersonProfile;
