import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { CastType, CrewType } from '@markmccoid/tmdb_api';
import CastItem from './CastItem';
import { Link, useRouter } from 'expo-router';

type Props = {
  showId: string;
  cast: { cast: CastType[]; crew: CrewType[] };
};
const CastContainer = ({ showId, cast }: Props) => {
  if (!cast) return;
  const router = useRouter();

  return (
    <View className="mx-[3] mb-4 flex-row flex-wrap justify-around">
      {cast.cast.map((member) => {
        return (
          <Pressable
            key={member.creditId}
            onPress={() => router.push(`/(authed)/${showId}/${member.personId}`)}>
            <CastItem key={member.creditId} castInfo={member} />
          </Pressable>
        );
      })}
    </View>
  );
};

export default CastContainer;
