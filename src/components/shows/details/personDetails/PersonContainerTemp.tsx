import { View, Text } from 'react-native';
import React, { useLayoutEffect, useMemo } from 'react';
import { usePersonDetails } from '~/data/query.shows';
import ShowImage from '~/components/common/ShowImage';
import SearchItem from '~/components/search/SearchItem';
import { reTagPersonShows } from '~/store/functions-shows';
import { savedShows$ } from '~/store/store-shows';
import { ScrollView } from 'moti';
import PersonShowItem from './PersonShowItem';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import BackHeaderButton from '~/components/common/headerButtons/BackHeaderButton';
import PersonProfile from './PersonProfile';

type Props = {
  personId: string;
  currentShowId: string;
};
const PersonContainer = ({ personId, currentShowId }: Props) => {
  const { data, isLoading } = usePersonDetails(personId);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (!data) return;
    const options: NativeStackNavigationOptions = {
      title: data?.personDetails.name || personId,
      headerLeft: () => <BackHeaderButton />,
    };
    navigation.setOptions(options);
  }, [data?.personDetails]);

  if (isLoading || !data) return null;

  // Tag the TV Shows with isStoredLocally key
  const taggedTV = reTagPersonShows(savedShows$.shows.peek(), data.tvShows);

  return (
    <View>
      <PersonProfile personInfo={data.personDetails} />
      <ScrollView contentContainerClassName="flex-row flex-wrap justify-between mx-2 pb-[50]">
        {taggedTV.map((show, index) => {
          return (
            <PersonShowItem
              key={show.tvShowId.toString() + index}
              showItem={show}
              numColumns={2}
              currentShowId={currentShowId}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PersonContainer;
