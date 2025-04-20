import { View, Text } from 'react-native';
import React from 'react';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import ShadowBackground from '~/components/common/ShadowBackground';

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
            <View key={key} className="mb-2 px-2 pb-2">
              <ShadowBackground />
              <Text className="text-lg font-semibold text-text">Season {key}</Text>
              <Text className="ml-2 text-text">
                Episodes - {seasonsSummary[parseInt(key)].totalEpisodes}
              </Text>

              <Text className="ml-2 text-text">
                Watched - {seasonsSummary[parseInt(key)].watched}
              </Text>
              {showDownloaded && (
                <Text className="ml-2 text-text">
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
