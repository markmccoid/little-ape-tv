import { View, Text } from 'react-native';
import React from 'react';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';

type Props = {
  showId: string;
};
const ScreenTwoSeasonData = ({ showId }: Props) => {
  const seasonsSummary = useSavedSeasonSummary(showId);
  const showDownloaded = use$(settings$.downloadOptions.showNextDownloadInfo);

  return (
    <View>
      {Object.keys(seasonsSummary)
        .filter((el) => !isNaN(parseInt(el))) // only grab season keys
        .filter((el) => parseInt(el) !== 0) // Remove the zero'th season
        .map((key: string) => {
          return (
            <View key={key}>
              <Text className="text-lg font-semibold">Season {key}</Text>
              <Text className="ml-2">Episodes - {seasonsSummary[parseInt(key)].totalEpisodes}</Text>

              <Text className="ml-2">Watched - {seasonsSummary[parseInt(key)].watched}</Text>
              {showDownloaded && (
                <Text className="ml-2">
                  Downloaded - {seasonsSummary[parseInt(key)].downloaded}
                </Text>
              )}
            </View>
          );
        })}
    </View>
  );
};

export default ScreenTwoSeasonData;
