import { View, Text } from 'react-native';
import React from 'react';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import ShadowBackground from '~/components/common/ShadowBackground';
import type { SeasonSummaryRow } from '~/db/types';

type Props = {
  // Season 0 (specials) is already excluded
  seasonSummaries: SeasonSummaryRow[];
};
const ScreenTwoSeasonData = ({ seasonSummaries }: Props) => {
  const showDownloaded = use$(settings$.downloadOptions.showNextDownloadInfo);

  return (
    <View>
      {seasonSummaries.map((season) => {
        return (
          <View key={season.season} className="mb-2 px-2 pb-2">
            <ShadowBackground />
            <Text className="text-lg font-semibold text-text">Season {season.season}</Text>
            <Text className="ml-2 text-text">Episodes - {season.totalEpisodes}</Text>

            <Text className="ml-2 text-text">Watched - {season.watched}</Text>
            {showDownloaded && (
              <Text className="ml-2 text-text">Downloaded - {season.downloaded}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ScreenTwoSeasonData;
