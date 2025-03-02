import { View, Text } from 'react-native';
import React from 'react';
import { useShowCast } from '~/data/query.shows';
import { CastType, CrewType, TVCredits } from '@markmccoid/tmdb_api';
import CastItem from './CastItem';

type Props = {
  showId: string;
  cast: { cast: CastType[]; crew: CrewType[] };
};
const CastContainer = ({ showId, cast }: Props) => {
  if (!cast) return;
  // const { data, isLoading } = useShowCast(showId);
  // if (!isLoading) {
  //   console.log('CastContainer', cast.cast.length, data);
  // }
  return (
    <View className="mx-[3] mb-4 flex-row flex-wrap justify-around">
      {cast.cast.map((member) => {
        return <CastItem key={member.creditId} castInfo={member} />;
      })}
    </View>
  );
};

export default CastContainer;
