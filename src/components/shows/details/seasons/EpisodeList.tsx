import React, { useCallback } from 'react';
import { SectionList, View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import getItemLayout from 'react-native-get-item-layout-section-list';
import { Episode, TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 70;
const ITEM_HEIGHT = 120;

type Props = {
  seasons: TVShowSeasonDetails[];
};

const TVShowSectionList: React.FC<Props> = ({ seasons }) => {
  const { showid } = useLocalSearchParams();
  // Map seasons to SectionList sections
  const sections = seasons.map((season) => ({
    title: season.seasonNumber === 0 ? season.name : `Season ${season.seasonNumber}`,
    data: season.episodes,
  }));

  const buildGetItemLayout = getItemLayout({
    getItemHeight: ITEM_HEIGHT,
    getSectionHeaderHeight: SECTION_HEADER_HEIGHT,
  });

  //==============================================
  // Render section header (season name)
  //==============================================
  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => {
    // console.log('header', section.title);
    return (
      <View
        className="flex-row  justify-start border-b-hairline bg-[#6a9c4fee] px-3 pt-2"
        style={{ height: SECTION_HEADER_HEIGHT }}>
        <Text className="text-xl font-bold">{section.title}</Text>
      </View>
    );
  }, []);

  //==============================================
  // Render Episode Items
  //==============================================
  const renderItem = useCallback(({ item, index }: { item: Episode; index: number }) => {
    // console.log('ITEM', index);
    return (
      <Pressable
        style={{ height: ITEM_HEIGHT }}
        className="border-b-hairline bg-white"
        onPress={async () => {
          const { imdbId } = await getEpisodeIMDBURL(
            parseInt(showid as string),
            item.seasonNumber,
            item.episodeNumber
          );

          if (imdbId === null) {
            return null;
          }
          Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
            Linking.openURL('https://apps.apple.com/us/app/imdb-movies-tv-shows/id342792525');
          });
        }}>
        <View className="mt-2 flex-row items-center px-2">
          <Image
            source={item.stillURL}
            // style={styles.image}
            style={{
              width: 100,
              height: 100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: '#ccc',
              borderRadius: 12,
            }}
            placeholder={require('../../../../../assets/missingPoster.png')}
          />
          {/* <Text>
            {item.episodeNumber}-{item.name}
          </Text>
          <Image source={{ uri: item.stillURL }} style={styles.image} /> */}
          <View className="mx-2  flex-1">
            <Text className="text-lg font-semibold text-text" numberOfLines={1}>
              {item.episodeNumber}. {item.name}
            </Text>
            <Text
              style={styles.overview}
              className="text-text"
              numberOfLines={3}
              ellipsizeMode="tail">
              {item.overview}
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text style={styles.footerText}>{item?.airDate?.formatted}</Text>
              <Text style={styles.footerText}>{item?.runTime} min</Text>
            </View>
          </View>
        </View>
      </Pressable>
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
