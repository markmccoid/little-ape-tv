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

  //~ ----------------------------
  //~ Scroll Season Scrollview
  //~ ----------------------------
  const scrollSeasons = (seasonNumber: number) => {
    const seasonIndex = sections.findIndex((section) => section.seasonNumber === seasonNumber);
    if (seasonIndex === -1) return;
    seasonScrollRef.current?.scrollTo({ x: seasonIndex * 105, y: 0, animated: true });
  };
  useEffect(() => {
    // seasonSummary.lastWatchedSeason;
    scrollSeasons(seasonSummary?.lastWatchedSeason || 0);
  }, [seasonSummary?.lastWatchedSeason]);
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
    if (seasonSummary?.lastWatchedSeason === undefined) return;

    // Get the last watched season
    const lastSeasonNumberWatched = seasonSummary.lastWatchedSeason;
    let episodeIndex = 0;
    // Find the next season with episodes, if it exists
    let nextSeasonNumber = lastSeasonNumberWatched + 1;
    const nextSeasonEpisodeWatched = seasonSummary?.[lastSeasonNumberWatched + 1]?.watched;

    if (
      nextSeasonNumber <= seasons.length && // Make sure there is a next season
      // BE CAREFUL, when we access the seasons array, we use zero based indexes
      // when we access seasonSummary we use the actual season number, i.e seasonNumber 1 needs to be 0 when accessing the seasons array
      seasons[nextSeasonNumber - 1]?.episodes?.length > 0 //Make sure there are episodes in the next season object
    ) {
      episodeIndex = nextSeasonEpisodeWatched || 0;
    } else {
      nextSeasonNumber = lastSeasonNumberWatched;
      episodeIndex = seasonSummary?.[nextSeasonNumber]?.watched || 0;
    }

    const seasonIndexToScroll = nextSeasonNumber - 1; // convert to an index for our scroll
    // If we are not moving to a new season, don't do the first scroll
    //NOTE: this first scroll was trying to fix an issue with the header now updating properly
    // need to check the episodeIndex (if first condition true, then don't scroll if we are another season with episodes watched)
    if (lastSeasonNumberWatched !== nextSeasonNumber && episodeIndex === 0) {
      scrollToLocation(seasonIndexToScroll, 0);
    }

    // Scroll to specific episode after a slight delay
    setTimeout(() => scrollToLocation(seasonIndexToScroll, episodeIndex), 100);
  }, [seasonSummary?.lastWatchedSeason, seasons.length, seasonSummary?.lastWatchedSeason == 0]);

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
        // initialScrollIndex={seasonSummary?.grandTotalWatched || 0}
        // onEndReached={() => {
        //   console.log('End reached');
        // }}
      />
    </View>
  );
};

export default memo(SeasonEpisodeList);
