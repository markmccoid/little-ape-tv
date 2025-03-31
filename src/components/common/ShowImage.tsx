import { View, Text, ImageStyle, ImageProps, Image as RNImage } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import React from 'react';
// import { getDefaultPosterImage } from '@/utils/utils';
import { getDefaultVideoImage, getNoImageFound } from '~/utils/utils';

type Props = {
  posterURL: string | undefined;
  title: string;
  imageWidth: number;
  imageHeight?: number;
  resizeMode?: ImageContentFit;
  imageStyle?: ImageStyle;
};

const ShowImage = ({
  imageStyle,
  posterURL,
  title,
  imageWidth,
  imageHeight,
  resizeMode = 'contain',
}: Props) => {
  if (!imageHeight) {
    imageHeight = imageWidth * 1.5;
  }
  const isDefaultImage = !posterURL;
  //const defaultPosterURL = posterURL;
  const defaultPosterURL = !posterURL && getNoImageFound();

  if (!posterURL) {
    return (
      <View className="flex-row">
        <Image
          className={`rounded-lg rounded-b-none border`}
          source={defaultPosterURL}
          style={{ width: imageWidth, height: imageHeight, opacity: 0.7, ...imageStyle }}
        />
        <Text
          className="absolute text-center font-semibold text-white"
          style={{ width: imageWidth, top: 8, paddingHorizontal: 6 }}
          numberOfLines={2}>
          {title}{' '}
        </Text>
      </View>
    );
  }
  return (
    <Image
      className="border-hairline border-border"
      source={{ uri: posterURL }}
      style={{
        width: imageWidth,
        height: imageHeight,
        overflow: 'hidden',
        ...imageStyle,
      }}
    />
  );
};

export default ShowImage;
