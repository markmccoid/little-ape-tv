import { View, Text, Dimensions, Pressable, TouchableOpacity, Linking, Alert } from 'react-native';
import React, { useEffect } from 'react';
import { CastTVShows, rawTVGetExternalIds, TVSearchResultItem } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
// import SearchItemButtonAnim from './SearchItemButtonAnim';
import useImageSize from '~/utils/useImageSize';
import ShowImage from '~/components/common/ShowImage';
import SearchItemButtonAnim from '~/components/search/SearchItemButtonAnim';
import PersonAddRemoveShow from './PersonAddRemoveShow';

const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

// type SearchItemData = {
//   id: string;
//   name: string;
//   posterURL: string;
//   isStoredLocally: boolean
// }

type Props = {
  showItem: CastTVShows & { isStoredLocally: boolean };
  numColumns: 2 | 3;
  currentShowId: string;
};

const PersonShowItem = ({ showItem, numColumns, currentShowId }: Props) => {
  const router = useRouter();
  const { imageHeight, imageWidth } = useImageSize(numColumns);

  return (
    <View className="mb-[25]">
      {/* <Link href={{ pathname: `/[showid]`, params: { showid: searchItem.id }, key={searchItem.id} }}> */}

      <Pressable
        onPress={() => {
          if (currentShowId === showItem.tvShowId.toString()) {
            router.back();
            return;
          }
          router.push({ pathname: `/[showid]`, params: { showid: showItem.tvShowId } });
        }}
        className="rounded-lg border-green-600 active:border-hairline">
        {/* <View className="absolute top-[-10] z-10 rounded-full border-hairline bg-green-500 px-2 py-1">
          <Text>{showItem.episodeCount}</Text>
        </View> */}

        <View
          style={{
            width: imageWidth,
          }}
          className="overflow-hidden rounded-lg border-hairline bg-white">
          <View className="flex-col items-center p-1">
            <Text className="flex-1" numberOfLines={1}>
              {showItem?.characterName}
            </Text>
            <Text>{showItem?.firstAirDate?.formatted}</Text>
          </View>
          <View>
            <ShowImage
              posterURL={showItem.posterURL}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              resizeMode="cover"
              title=""
            />
            {!showItem?.posterURL && (
              <View className="absolute top-0 z-10 w-full px-[4] py-[2] ">
                <Text
                  className="flex-1 text-center font-Asul-Bold text-lg font-medium"
                  numberOfLines={2}>
                  {showItem.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
      {/* </Link> */}
      {/* Title and Add/Remove Button */}
      <PersonAddRemoveShow showItem={showItem} />
    </View>
  );
};

export default React.memo(PersonShowItem);
