import { View, Text } from 'react-native';
import React from 'react';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';

type Props = {
  showId: string;
};
const ScreenTwoSeasonData = ({ showId }: Props) => {
  const seasonsSummary = useSavedSeasonSummary(showId);
  return (
    <View>
      <Text className="text-lg font-semibold">Seasons</Text>
      {Object.keys(seasonsSummary)
        .filter((el) => !isNaN(parseInt(el))) // only grab season keys
        .map((key: string) => {
          return (
            <View className="flex-row items-center gap-2" key={key}>
              <Text>S-{key}</Text>
              <Text>Eps-{seasonsSummary[parseInt(key)].totalEpisodes}</Text>
              <Text>W-{seasonsSummary[parseInt(key)].watched}</Text>
              <Text>D-{seasonsSummary[parseInt(key)].downloaded}</Text>
            </View>
          );
        })}
    </View>
  );
};

export default ScreenTwoSeasonData;
