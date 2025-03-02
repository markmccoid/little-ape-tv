import React, { useCallback } from 'react';
import { SectionList, View, Text, StyleSheet, Pressable, Linking } from 'react-native';

import getItemLayout from 'react-native-get-item-layout-section-list';
import { Episode, TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL, ShowDetailsData, UseShowDetailsReturn } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';
import EpisodeRow from './EpisodeRow';
import { TelevisionIcon, TelevisionOffIcon } from '~/components/common/Icons';
import { updateAllEpisodesWatched, useWatchedEpisodeCount } from '~/store/functions-shows';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 70;
const ITEM_HEIGHT = 120;

type Props = {
  seasons: TVShowSeasonDetails[];
  showData: ShowDetailsData;
};

const TVShowSectionList: React.FC<Props> = ({ seasons, showData }) => {
  const { showid } = useLocalSearchParams();
  const watchedCounts = useWatchedEpisodeCount(showid as string);
  // Map seasons to SectionList sections
  const sections = seasons.map((season) => ({
    title: season.seasonNumber === 0 ? season.name : `Season ${season.seasonNumber}`,
    numEpisodes: season.episodes.length,
    seasonNumber: season.seasonNumber,
    counts: watchedCounts?.[season.seasonNumber] || { watched: 0, downloaded: 0 }, //Return watched/download counts if they exists
    data: season.episodes,
  }));

  const buildGetItemLayout = getItemLayout({
    getItemHeight: ITEM_HEIGHT,
    getSectionHeaderHeight: SECTION_HEADER_HEIGHT,
  });

  //==============================================
  // Render section header (season name)
  //==============================================
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: {
        title: string;
        numEpisodes: number;
        seasonNumber: number;
        counts: { watched: number; downloaded: number };
      };
    }) => {
      // console.log('header', Object.keys(sections[0].data[0]));
      return (
        <View
          className="flex-col border-b-hairline bg-[#6a9c4fee] px-3 pt-2"
          style={{ height: SECTION_HEADER_HEIGHT }}>
          {/* First Line */}
          <View>
            <Text className="text-xl font-bold">{section.title}</Text>
            <Text>
              {section.counts.watched}/{section.numEpisodes} watched
            </Text>
          </View>
          {/* Second Line */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={() =>
                updateAllEpisodesWatched(
                  showid as string,
                  section.seasonNumber,
                  section.numEpisodes,
                  'watched'
                )
              }>
              <TelevisionIcon size={25} />
            </Pressable>
            <Pressable
              onPress={() =>
                updateAllEpisodesWatched(
                  showid as string,
                  section.seasonNumber,
                  section.numEpisodes,
                  'unwatched'
                )
              }>
              <TelevisionOffIcon size={25} />
            </Pressable>
          </View>
        </View>
      );
    },
    []
  );

  //==============================================
  // Render Episode Items
  //==============================================
  const renderItem = useCallback(({ item, index }: { item: Episode; index: number }) => {
    // console.log('ITEM', index);
    return (
      <EpisodeRow
        item={item}
        showId={showid as string}
        isStoredLocally={showData.isStoredLocally}
      />
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});

export default TVShowSectionList;
