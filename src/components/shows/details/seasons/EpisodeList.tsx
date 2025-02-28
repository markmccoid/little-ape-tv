import React, { useCallback } from 'react';
import { SectionList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import getItemLayout from 'react-native-get-item-layout-section-list';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 40;
const ITEM_HEIGHT = 120;

interface Props {
  seasons: TVShowSeasonDetails[];
  onPressEpisode: (episode: Episode) => void;
}

type TVShowSeasonDetails = {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterURL: string;
  airDate: DateObject;
  episodes: Episode[];
};

type Episode = {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: DateObject;
  stillURL: string;
  runTime: number;
};

type DateObject = {
  date?: Date;
  epoch: number;
  formatted: string;
};

const TVShowSectionList: React.FC<Props> = ({ seasons, onPressEpisode }) => {
  // Map seasons to SectionList sections
  const sections = seasons.map((season) => ({
    title: season.name,
    data: season.episodes,
  }));

  const buildGetItemLayout = getItemLayout({
    getItemHeight: ITEM_HEIGHT,
    getSectionHeaderHeight: SECTION_HEADER_HEIGHT,
  });

  // Render section header (season name)
  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => {
    // console.log('header', section.title);
    return (
      <View
        className="flex-row items-center bg-[#ffffffdd]"
        style={{ height: SECTION_HEADER_HEIGHT }}>
        <Text className="text-xl font-bold">{section.title}</Text>
      </View>
    );
  }, []);

  // Render each episode item
  const renderItem = useCallback(({ item, index }: { item: Episode; index: number }) => {
    // console.log('ITEM', index);
    return (
      <TouchableOpacity
        style={{ height: ITEM_HEIGHT }}
        onPress={() => console.log(item)}
        className="border-b-hairline">
        <View className="mt-2 flex-row items-center px-2">
          <Image
            source={item.stillURL}
            style={styles.image}
            className="rounded-xl border-hairline"
            placeholder={require('../../../../../assets/missingPoster.png')}
          />
          {/* <Text>
            {item.episodeNumber}-{item.name}
          </Text>
          <Image source={{ uri: item.stillURL }} style={styles.image} /> */}
          <View className="ml-2  flex-1">
            <Text className="text-lg font-semibold" numberOfLines={1}>
              {item.episodeNumber}. {item.name}
            </Text>
            <Text style={styles.overview} numberOfLines={3} ellipsizeMode="tail">
              {item.overview}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.footerText}>{item?.airDate?.formatted}</Text>
              <Text style={styles.footerText}>{item?.runTime} min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.seasonNumber.toString() + item.episodeNumber.toString()}
      contentContainerStyle={{ paddingBottom: 55 }}
      style={{ width: '100%' }}
      getItemLayout={buildGetItemLayout}
    />
  );
};

// Styles
const styles = StyleSheet.create({
  header: {
    height: SECTION_HEADER_HEIGHT,
    lineHeight: SECTION_HEADER_HEIGHT,
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    height: ITEM_HEIGHT,
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
  },
  overview: {
    fontSize: 14,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default TVShowSectionList;
