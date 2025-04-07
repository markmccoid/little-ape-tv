import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { movieGetDetails, moviePersonCredits_typedef } from '@markmccoid/tmdb_api';
import useImageSize from '~/utils/useImageSize';
import ShowImage from '~/components/common/ShowImage';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';

const { width, height } = Dimensions.get('window');
const IMG_WIDTH = (width - 30) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  movieItem: moviePersonCredits_typedef['data']['cast'][0];
  numColumns: 2 | 3;
};

const PersonMovieItem = ({ movieItem, numColumns }: Props) => {
  const { imageHeight, imageWidth } = useImageSize(numColumns);

  return (
    <View className="mb-[25]">
      <Pressable
        onPress={async () => {
          try {
            Linking.openURL(`littleapemovies:///search/${movieItem.movieId}`);
          } catch (error) {
            // If you can't open the app, open the web page
            const {
              data: { imdbId },
            } = await movieGetDetails(movieItem.movieId);
            Linking.openURL(`https://imdb.com/name/${imdbId}`);
          }
        }}
        style={{
          width: imageWidth,
        }}
        className="overflow-hidden rounded-lg border-hairline bg-white">
        <View className="flex-row items-center justify-start border-b-hairline bg-card p-1">
          <Text className="flex-1 font-semibold" numberOfLines={1}>
            {movieItem?.characterName}
          </Text>
          <Text className="text-xs">{movieItem?.releaseDate?.formatted}</Text>
        </View>
        <View>
          <ShowImage
            posterURL={movieItem.posterURL}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            resizeMode="cover"
            title=""
          />
          {!movieItem?.posterURL && (
            <View className="absolute top-0 z-10 w-full px-[4] py-[2] ">
              <Text
                className="flex-1 text-center font-Asul-Bold text-lg font-medium"
                numberOfLines={2}>
                {movieItem.title}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default PersonMovieItem;
