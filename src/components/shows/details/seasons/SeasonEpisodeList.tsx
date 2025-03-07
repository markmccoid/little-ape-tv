import React, { useCallback, useEffect, useRef } from 'react';
import { SectionList, View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native';

import getItemLayout from 'react-native-get-item-layout-section-list';
import { Episode, TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL, ShowDetailsData, UseShowDetailsReturn } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';
import EpisodeRow from './EpisodeRow';
import { CheckIcon, TelevisionIcon, TelevisionOffIcon } from '~/components/common/Icons';
import {
  removeSeasonFromWatched,
  SeasonEpisodesState,
  setSeasonToWatched,
  updateAllEpisodesWatched,
  useWatchedEpisodeCount,
} from '~/store/functions-showAttributes';
import SeasonHeader from './SeasonHeader';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 70;
const ITEM_HEIGHT = 120;

type Props = {
  seasons: TVShowSeasonDetails[];
  showData: ShowDetailsData;
};

export type SeasonsSection = {
  title: string;
  numEpisodes: number;
  seasonNumber: number;
  counts: { watched: number; downloaded: number; allWatched: boolean; allDownloaded: boolean };
};
const TVShowSectionList: React.FC<Props> = ({ seasons, showData }) => {
  const { showid } = useLocalSearchParams();
  const sectionListRef = useRef<SectionList>(null);
  const watchedCounts = useWatchedEpisodeCount(showid as string, seasons);

  // Map seasons to SectionList sections
  const sections = seasons.map((season) => ({
    title: season.seasonNumber === 0 ? season.name : `Season ${season.seasonNumber}`,
    numEpisodes: season.episodes.length,
    seasonNumber: season.seasonNumber,
    counts: watchedCounts?.[season.seasonNumber] || {
      watched: 0,
      downloaded: 0,
      allDownloaded: false,
      allWatched: false,
    }, //Return watched/download counts if they exists
    data: season.episodes,
  }));

  const buildGetItemLayout = getItemLayout({
    getItemHeight: ITEM_HEIGHT,
    getSectionHeaderHeight: SECTION_HEADER_HEIGHT,
  });
  // Find the lastSeasonWatched (0 means no season watched)
  // then check if the season following (if exists) has any watched episodes
  // scroll to first unwatched episode index
  useEffect(() => {
    if (
      sectionListRef.current &&
      (watchedCounts?.lastWatchedSeason || watchedCounts?.lastWatchedSeason === 0) &&
      // If last season watched is the last season then we can't scroll past it.
      // This keeps that from happening
      watchedCounts?.lastWatchedSeason < seasons.length
    ) {
      const episodeIndex =
        watchedCounts.lastWatchedSeason + 1 <= seasons.length
          ? watchedCounts[watchedCounts.lastWatchedSeason + 1]?.watched || 0
          : 0;
      setTimeout(() => scrollToLocation(watchedCounts.lastWatchedSeason, episodeIndex), 100);
    }
  }, [watchedCounts?.lastWatchedSeason, sectionListRef.current]);

  const scrollToLocation = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: sectionIndex,
        itemIndex: itemIndex,
        viewOffset: 0, // Adjust this value to account for any headers or offset you want
        animated: true, // Set to false if you don't want animation
      });
    },
    [sectionListRef]
  );
  // =---------------------------------------------
  // Scroll to the first unwatched episode
  // =---------------------------------------------
  // useEffect(() => {

  //   sectionListRef.current?.scrollToLocation({
  //     sectionIndex: 5,
  //     itemIndex: 2,
  //     viewOffset: 0, // Adjust this value to account for any headers or offset you want
  //     animated: true, // Set to false if you don't want animation
  //   });
  // }, [sectionListRef]);
  //==============================================
  // Render section header (season name)
  //==============================================
  const renderSectionHeader = useCallback(({ section }: { section: SeasonsSection }) => {
    // console.log('header', Object.keys(sections[0].data[0]));
    return (
      <SeasonHeader
        showId={showid as string}
        section={section}
        headerHeight={SECTION_HEADER_HEIGHT}
      />
    );
  }, []);

  //==============================================
  // Render Episode Items
  //==============================================
  const renderItem = useCallback(({ item, index }: { item: Episode; index: number }) => {
    // console.log('ITEM', index);
    return (
      <View
        style={{
          // borderBottomWidth: 2, //StyleSheet.hairlineWidth,
          // borderColor: 'black',
          height: ITEM_HEIGHT,
        }}>
        <EpisodeRow
          item={item}
          showId={showid as string}
          isStoredLocally={showData.isStoredLocally}
        />
      </View>
    );
  }, []);

  return (
    <View className="flex-1">
      <ScrollView
        horizontal
        className="my-1 flex-row"
        contentContainerClassName="gap-2 px-2"
        showsHorizontalScrollIndicator={false}>
        {sections.map((section, index) => (
          <Pressable
            key={section.title}
            onPress={() => scrollToLocation(index, 0)}
            className={`flex-row rounded-lg border bg-button px-2 py-1 ${section.counts?.allWatched ? 'bg-buttondarker' : ''}`}>
            <Text
              className={`font-semibold ${section.counts?.allWatched ? 'text-buttondarkertext' : 'text-buttontext'} `}>
              {section.title}
            </Text>
            {section.counts.allWatched && (
              <View className="ml-[3]">
                <CheckIcon size={15} color="white" />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.seasonNumber.toString() + item.episodeNumber.toString()}
        contentContainerStyle={{ paddingBottom: 55 }}
        style={{ width: '100%' }}
        getItemLayout={buildGetItemLayout}
      />
    </View>
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

export default React.memo(TVShowSectionList);
