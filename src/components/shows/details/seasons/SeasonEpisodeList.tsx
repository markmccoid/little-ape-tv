import React, { useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { SectionList, View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native';

import getItemLayout from 'react-native-get-item-layout-section-list';
import { Episode, TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { getEpisodeIMDBURL, ShowDetailsData, UseShowDetailsReturn } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';
import EpisodeRow from './EpisodeRow';
import { CheckIcon, TelevisionIcon, TelevisionOffIcon } from '~/components/common/Icons';
import { updateSeasonSummary, useSavedSeasonSummary } from '~/store/functions-showAttributes';
import SeasonHeader from './SeasonHeader';
import { useObservable, useObserveEffect } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 70;
const ITEM_HEIGHT = 125;
const ITEM_SEPARATOR_HEIGHT = 18;

type Props = {
  seasons: TVShowSeasonDetails[];
  showData: ShowDetailsData;
};

const ItemSeparator = () => (
  <View className="bg-red-600" style={{ height: ITEM_SEPARATOR_HEIGHT }} />
);
export type SeasonsSection = {
  title: string;
  numEpisodes: number;
  seasonNumber: number;
  counts: { watched: number; downloaded: number; allWatched: boolean; allDownloaded: boolean };
};
const SeasonEpisodeList: React.FC<Props> = ({ seasons, showData }) => {
  // const [sectionPadding, setSectionPadding] = React.useState(110);
  const { showid } = useLocalSearchParams();
  const sectionListRef = useRef<SectionList>(null);
  const seasonScrollRef = useRef<ScrollView>(null);
  const seasonSummary = useSavedSeasonSummary(showid as string);

  //# this legend state hook will fire when a change is made to the showAttributes
  //# which will in turn update the seasonSummary data on the showAttributes[showId] observable
  // This makes sure our summary object is updated when items are marked as watched/downloaded/etc.
  useObserveEffect(() => {
    savedShows$.showAttributes[showid as string].get();
    // updateSeasonSummary will not update anything if the show is not stored locally
    updateSeasonSummary(showid as string, seasons);
  });

  const isStoredLocally = showData.isStoredLocally;
  // Map seasons to SectionList sections
  const sections = useMemo(
    () =>
      seasons
        .filter((season) => season.episodes.length > 0) //Filter any seasons with no episodes
        .map((season) => ({
          title: season.seasonNumber === 0 ? season.name : `Season ${season.seasonNumber}`,
          numEpisodes: season.episodes.length,
          seasonNumber: season.seasonNumber,
          counts: seasonSummary?.[season.seasonNumber] || {
            favorited: 0,
            watched: 0,
            downloaded: 0,
            allDownloaded: false,
            allWatched: false,
          }, //Return watched/download counts if they exists
          data: season.episodes,
        })),
    [seasons, seasonSummary]
  );

  //!! ----- DEBUG GET ITEM LAYOUT ---
  const buildGetItemLayout = getItemLayout({
    getItemHeight: ITEM_HEIGHT,
    // getItemSeparatorHeight: ITEM_SEPARATOR_HEIGHT,
    getSectionHeaderHeight: SECTION_HEADER_HEIGHT,
  });

  const scrollToLocation = useCallback((sectionIndex: number, itemIndex: number) => {
    sectionListRef.current?.scrollToLocation({
      sectionIndex: sectionIndex,
      itemIndex: itemIndex,
      viewOffset: 0, // Adjust this value to account for any headers or offset you want
      animated: true, // Set to false if you don't want animation
    });
  }, []);

  //==============================================
  // Scroll to the last watched season and episode
  //==============================================
  useEffect(() => {
    if (!seasonSummary?.lastWatchedSeason) return;

    const lastSeasonWatched = seasonSummary.lastWatchedSeason;
    const episodeIndex =
      lastSeasonWatched + 1 <= seasons.length
        ? seasonSummary?.[lastSeasonWatched + 1]?.watched || 0
        : 0;
    const seasonIndexToScroll =
      lastSeasonWatched === seasons.length ? lastSeasonWatched - 1 : lastSeasonWatched;

    // Initial scroll to season
    scrollToLocation(seasonIndexToScroll, 0);

    // Scroll to specific episode after a slight delay
    setTimeout(() => scrollToLocation(seasonIndexToScroll, episodeIndex), 100);
  }, [seasonSummary?.lastWatchedSeason, seasons.length, scrollToLocation]);

  //! SHOULD BE ABLE TO DELETE after testing - 04/22/2025
  // useEffect(() => {
  //   console.log('Scroll 2');
  //   if (seasonScrollRef.current && seasonSummary?.lastWatchedSeason) {
  //     const xOffset = (seasonSummary.lastWatchedSeason - 1) * 105;
  //     if (xOffset >= 0) {
  //       setTimeout(() => seasonScrollRef.current?.scrollTo({ x: xOffset, animated: false }), 0);
  //     }
  //   }
  // }, [seasonSummary?.lastWatchedSeason]);
  //!

  //==============================================
  // Render section header (season name)
  //==============================================
  const renderSectionHeader = useCallback(
    ({ section }: { section: SeasonsSection }) => {
      return (
        <SeasonHeader
          showId={showid as string}
          section={section}
          isStoredLocally={isStoredLocally}
          headerHeight={SECTION_HEADER_HEIGHT}
        />
      );
    },
    [showid]
  );

  //==============================================
  // Render Episode Items
  //==============================================
  const renderItem = useCallback(
    ({ item }: { item: Episode }) => {
      // Removed index, not used
      return (
        <EpisodeRow
          item={item}
          showId={showid as string}
          isStoredLocally={showData.isStoredLocally}
        />
      );
    },
    [showData.isStoredLocally, showid]
  );

  const keyExtractor = useCallback(
    (item: Episode) => item.seasonNumber.toString() + item.episodeNumber.toString(),
    []
  );

  return (
    <View className="flex-1">
      <ScrollView
        ref={seasonScrollRef}
        horizontal
        className="my-2 shrink "
        contentContainerClassName="gap-[8] px-2"
        showsHorizontalScrollIndicator={false}>
        {sections.map((section, index) => (
          <Pressable
            key={section.title}
            onPress={() => scrollToLocation(index, 0)}
            className={`w-[97] flex-row justify-center rounded-lg border bg-button px-[8] py-1 ${section.counts?.allWatched ? 'bg-buttondarker' : ''}`}>
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
        stickySectionHeadersEnabled={true}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 115 }}
        // style={{ width: '100%', paddingBottom: 105, height: '100%' }}
        getItemLayout={buildGetItemLayout}
        initialScrollIndex={seasonSummary?.grandTotalWatched || 0}
        // onEndReached={() => {
        //   console.log('End reached');
        // }}
      />
    </View>
  );
};

export default memo(SeasonEpisodeList);
