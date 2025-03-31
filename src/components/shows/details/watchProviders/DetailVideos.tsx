import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { ShowDetailsData } from '~/data/query.shows';
import { YouTubePlayIcon } from '~/components/common/Icons';
import ShowImage from '~/components/common/ShowImage';

type Props = {
  videoData: ShowDetailsData['videos'];
};

const THUMBNAIL_WIDTH = 120 * 1.77;
const THUMBNAIL_HEIGHT = 120;

const DetailVideos = ({ videoData }: Props) => {
  return (
    <View className="">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {videoData &&
          videoData.map((video) => {
            return (
              <TouchableOpacity
                key={video.id}
                style={{
                  marginHorizontal: 10,
                }}
                onPress={() => Linking.openURL(video.videoURL)}>
                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{video.type}</Text>
                <View
                  style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: THUMBNAIL_HEIGHT / 2 - 15,
                    left: THUMBNAIL_WIDTH / 2 - 30,
                  }}>
                  <YouTubePlayIcon size={60} style={{ opacity: 0.7 }} />
                </View>
                <ShowImage
                  title="Video"
                  posterURL={video.videoThumbnailURL}
                  imageWidth={THUMBNAIL_WIDTH}
                  imageHeight={THUMBNAIL_HEIGHT}
                  imageStyle={{
                    borderRadius: 10,
                    opacity: 0.7,
                    borderColor: '#777',
                    borderWidth: 1,
                  }}
                />
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default DetailVideos;
