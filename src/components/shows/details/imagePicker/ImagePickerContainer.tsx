import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useShowImages } from '~/data/query.shows';
import { AnimatePresence, MotiView } from 'moti';
import { savedShows$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';

const { width, height } = Dimensions.get('window');
const imageWidth = (width - 25) / 2;

const ImagePickerContainer = () => {
  const { showid } = useLocalSearchParams();
  const { data: showImages, isLoading } = useShowImages(parseInt(showid as string));
  const { posterURL } = use$(savedShows$.shows[showid as string]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelect = (imageUrl: string) => {
    savedShows$.shows[showid as string].set((prev) => ({ ...prev, posterURL: imageUrl }));
    setSelectedImage(null);
  };

  if (isLoading) {
    return <ActivityIndicator size={'large'} />;
  }
  return (
    <AnimatePresence>
      {/* Large Image Overlay */}
      {selectedImage && (
        <MotiView
          key="largeImage"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffffdd',
            // backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 400 }}>
          <View style={{ alignItems: 'center' }}>
            <MotiView
              from={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'timing', duration: 400 }}>
              <Image
                style={{
                  width: width * 0.9,
                  height: width * 0.9 * 1.5,
                  borderRadius: 10,
                  borderWidth: StyleSheet.hairlineWidth,
                }}
                source={selectedImage}
              />
            </MotiView>

            {/* Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: width * 0.9,
                marginTop: 10,
              }}>
              <Pressable
                onPress={() => handleSelect(selectedImage)}
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Select</Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedImage(null)}
                style={{
                  backgroundColor: '#f44336',
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      )}

      {/* Horizontal Thumbnail Scroll */}
      <MotiView
        key="thumbnailGrid"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400 }}>
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: 5,
            justifyContent: 'space-between',
            height: 'auto', // Allows wrapping to work
          }}
          // showsVerticalScrollIndicator={false}
        >
          {showImages?.map((showImage) => (
            <Pressable
              key={showImage}
              onPress={() => setSelectedImage(showImage)}
              style={{ margin: 2.5 }}>
              <MotiView
                animate={{
                  opacity: selectedImage === showImage ? 0.7 : 1,
                  scale: selectedImage === showImage ? 0.95 : 1,
                }}
                transition={{
                  type: 'timing',
                  duration: 200,
                }}
                style={{
                  borderWidth: posterURL === showImage ? 2 : 0,
                  borderColor: posterURL === showImage ? 'red' : '',
                  borderRadius: 12,
                }}>
                <Image
                  style={{
                    width: imageWidth,
                    height: imageWidth * 1.5,
                    borderRadius: 10,
                    borderWidth: StyleSheet.hairlineWidth,
                  }}
                  source={{ uri: showImage }}
                />
              </MotiView>
            </Pressable>
          ))}
        </ScrollView>
      </MotiView>
    </AnimatePresence>
  );
};

export default ImagePickerContainer;
