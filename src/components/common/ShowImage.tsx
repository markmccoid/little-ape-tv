import { View, Text, ImageStyle, ImageProps, Image as RNImage } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import React from 'react';
// import { getDefaultPosterImage } from '@/utils/utils';
import { getDefaultVideoImage, getNoImageFound, getNoImageFound2 } from '~/utils/utils';

type Props = {
  posterURL: string | undefined;
  title: string;
  imageWidth: number;
  imageHeight?: number;
  resizeMode?: ImageContentFit;
  imageStyle?: ImageStyle;
  isLoading?: boolean; // Optional, but will not display a "missing" image unless false
};

const ShowImage = ({
  imageStyle,
  posterURL,
  title,
  imageWidth,
  imageHeight,
  resizeMode = 'contain',
  isLoading,
}: Props) => {
  if (!imageHeight) {
    imageHeight = imageWidth * 1.5;
  }
  const isDefaultImage = !posterURL;
  //const defaultPosterURL = posterURL;
  const defaultPosterURL = !posterURL && getNoImageFound2(title);

  if (!posterURL) {
    return (
      <View className="flex-row">
        <Image
          className={`rounded-lg rounded-b-none border`}
          source={isLoading ? [] : defaultPosterURL}
          style={{ width: imageWidth, height: imageHeight, opacity: 0.7, ...imageStyle }}
        />

        {!isLoading && (
          <View className="absolute left-0 right-0 top-1 z-0 mx-auto px-[10]">
            <View className="rounded-md border-hairline bg-white/70 py-2">
              <Text className="z-20 text-center font-semibold text-black" numberOfLines={2}>
                {title}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
  return (
    <Image
      className="border-hairline border-border"
      source={{ uri: posterURL }}
      transition={200}
      contentFit={resizeMode}
      style={{
        width: imageWidth,
        height: imageHeight,
        overflow: 'hidden',
        ...imageStyle,
      }}
    />
  );
};

export default React.memo(ShowImage);
