import { View, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { SavedShow } from '~/store/functions-shows';
import { TVShowDetails } from '@markmccoid/tmdb_api';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { savedShows$ } from '~/store/store-shows';
import { AnimatePresence, MotiView } from 'moti';
import DetailContextMenu from '~/components/zeego/DetailContextMenu';

const { width, height } = Dimensions.get('window');
type Props = {
  showData: (Partial<SavedShow> & Partial<TVShowDetails>) | undefined;
};
const DetailHeader = ({ showData }: Props) => {
  if (!showData) return;

  return (
    <View className="flex-row  rounded-xl border">
      <AnimatePresence>
        {showData.favorite && (
          <Pressable
            className="absolute bottom-[-10] right-[-10] z-10"
            onPress={() => {
              savedShows$.toggleFavoriteShow(showData.tmdbId as string, 'toggle');
            }}>
            <MotiView
              key="a"
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: showData.favorite ? 1 : 0, scale: showData.favorite ? 1 : 0 }}
              transition={{ type: 'timing', duration: 300 }}
              exit={{ opacity: 0, scale: 0 }}>
              <SymbolView name="heart.fill" tintColor="red" size={25} />
            </MotiView>
          </Pressable>
        )}
      </AnimatePresence>
      <View className="overflow-hidden  rounded-xl">
        <DetailContextMenu
          existsInSaved={showData.isStoredLocally || false}
          showId={showData.id}
          showName={showData.name}
          shareLink={showData.imdbURL}>
          <Image
            source={showData?.posterURL}
            style={{ width: width / 2.3, height: (width / 2.3) * 1.5 }}
          />
        </DetailContextMenu>
      </View>
    </View>
  );
};

export default DetailHeader;
