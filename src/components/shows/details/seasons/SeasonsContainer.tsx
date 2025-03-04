import { View, Text, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { ShowDetailsData, useShowDetails, useShowSeasonData } from '~/data/query.shows';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SeasonEpisodeList from './SeasonEpisodeList';
import { CloseIcon } from '~/components/common/Icons';

type Props = {
  showData: ShowDetailsData;
};
const SeasonsContainer = () => {
  const { showid } = useLocalSearchParams();
  const router = useRouter();
  const { data: showData } = useShowDetails(parseInt(showid as string));
  // console.log('SeasonsContainer', showid, showData.tmdbId);
  const seasons = useMemo(() => {
    return showData.seasons?.map((el) => el.seasonNumber) || [];
  }, [showid, showData.tmdbId]);
  // console.log('SEASONS', seasons);
  const { data, isLoading } = useShowSeasonData(showid as string, seasons);
  // console.log('SeasonEpisode Data', data[0]);

  return (
    <View className="mb-20 flex-1">
      {/* Modal Header */}
      <View className="h-12 flex-row items-center justify-center bg-gray-800">
        <View className="ml-3  flex-row items-center ">
          <Text
            className="flex-1 px-12 text-center text-xl font-bold text-white"
            numberOfLines={1}
            ellipsizeMode="tail">
            {showData.name}
          </Text>
        </View>
        <View className="absolute right-2 rounded-lg border-hairline bg-slate-300 p-[2]">
          <Pressable onPress={() => router.back()}>
            <CloseIcon size={20} />
          </Pressable>
        </View>
      </View>
      {/* SectionList Component */}
      {!isLoading && <SeasonEpisodeList seasons={data} showData={showData} />}
    </View>
  );
};

export default SeasonsContainer;
