import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { ShowDetailsData } from '~/data/query.shows';

type Props = {
  data: ShowDetailsData;
};
const DetailInfo = ({ data }: Props) => {
  return (
    <View className="h-1/2 rounded-lg border-hairline bg-[#ffffff77] p-1">
      <LabelTextDisplay label="Run Time:" text={data?.avgEpisodeRunTime} />
      <LabelTextDisplay label="Status:" text={data?.status} />
      {/* <LabelTextDisplay label="First Episode:" text={data?.firstAirDate?.formatted} />
      {data?.lastAirDate?.formatted && (
        <LabelTextDisplay label="Last Episode:" text={data?.lastAirDate?.formatted} />
      )} */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center justify-start">
        {data?.nextAirDate && (
          <View className="mr-2 flex-col items-center justify-start rounded-lg border-hairline bg-purple-500/40 px-2 py-1">
            <LabelTextDisplay label="Next:" text={data?.nextAirDate?.formatted} />
          </View>
        )}
        <View className="mr-2 flex-col items-center justify-start rounded-lg border-hairline bg-green-500/40 px-2 py-1">
          <LabelTextDisplay label="First:" text={data?.firstAirDate?.formatted} />
        </View>
        <View className="mr-2 flex-col items-center justify-start rounded-lg border-hairline bg-red-500/40 px-2 py-1">
          <LabelTextDisplay label="Last:" text={data?.lastAirDate?.formatted} />
        </View>
      </ScrollView>
      <Text>{`${data?.numberOfSeasons} Seasons / ${data?.numberOfEpisodes} Episodes`}</Text>
      {/* <Text>{data?.genres?.map((el) => el)}</Text> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center justify-start">
        {data?.genres?.map((genre) => (
          <View
            className="mr-2 flex-row items-center justify-start rounded-lg border-hairline bg-[#ffffff77] p-1"
            key={genre}>
            <Text key={genre} className="">
              {genre}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

function LabelTextDisplay({ label, text }: { label: string; text: string | number | undefined }) {
  if (!text) text = '';
  return (
    <View className="flex-row">
      <Text className="font-bold">{label}</Text>
      <Text> {text}</Text>
    </View>
  );
}

export default DetailInfo;
