import React, { useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { SectionList, View, Text, Pressable, ScrollView } from 'react-native';

import getItemLayout from 'react-native-get-item-layout-section-list';
import { Episode, TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { ShowDetailsData } from '~/data/query.shows';
import { useLocalSearchParams } from 'expo-router';
import EpisodeRow from './EpisodeRow';
import { CheckIcon } from '~/components/common/Icons';
import { updateSeasonSummary, useSavedSeasonSummary } from '~/store/functions-showAttributes';
import SeasonHeader from './SeasonHeader';
import { useObserveEffect } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';

// Define fixed heights for performance
const SECTION_HEADER_HEIGHT = 70;
const ITEM_HEIGHT = 125;

type Props = {
  seasons: TVShowSeasonDetails[];
  showData: ShowDetailsData;
};

export type SeasonsSection = {
  title: string;
  numEpisodes: number;
  seasonNumber: number;
  counts: { watched: number; downloaded: number; allWatched: boolean; allDownloaded: boolean };
  data: Episode[];
};
const SeasonEpisodeList: React.FC<Props> = ({ seasons, showData }) => {
  // const [sectionPadding, setSectionPadding] = React.useState(110);
  const { showid } = useLocalSearchParams();
  const sectionListRef = useRef<SectionList<Episode, SeasonsSection>>(null);
  const seasonScrollRef = useRef<ScrollView>(null);
  const seasonSummary = useSavedSeasonSummary(showid as string);
  const [showFavs, setShowFavs] = React.useState(false);

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
        .map((season) => {
          // Filter episodes based on showFavs setting
          const filteredEpisodes = showFavs
            ? season.episodes.filter((episode) => {
                // Get episode attributes to check if favorited
                const episodeAttributes =
                  savedShows$.showAttributes[showid as string]?.seasons?.[episode.seasonNumber]
                    ?.episodes?.[episode.episodeNumber];
                return episodeAttributes?.f?.peek();
              })
            : season.episodes;

          return {
            title: season.seasonNumber === 0 ? season.name : `Season ${season.seasonNumber}`,
            numEpisodes: filteredEpisodes.length,
            seasonNumber: season.seasonNumber,
            counts: seasonSummary?.[season.seasonNumber] || {
              favorited: 0,
              watched: 0,
              downloaded: 0,
              allDownloaded: false,
              allWatched: false,
            }, //Return watched/download counts if they exists
            data: filteredEpisodes,
          };
        })
        .filter((section) => section.data.length > 0), // Remove sections with no episodes (important when showFavs is true)
    [seasons, seasonSummary, showFavs, showid]
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
          section={section as SeasonsSection}
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
      <View
        // style={{ height: 44 }}
        className="my-1 flex-row">
        <ScrollView
          ref={seasonScrollRef}
          horizontal
          className="shrink"
          contentContainerClassName="px-2"
          showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-[8] ">
            {sections.map((section, index) => (
              <Pressable
                key={section.title}
                onPress={() => scrollToLocation(index, 0)}
                className={`w-[97] flex-row justify-center rounded-lg border bg-button px-[8] py-[2] ${section.counts?.allWatched ? 'bg-buttondarker' : ''}`}>
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
            <Pressable
              onPress={() => setShowFavs(!showFavs)}
              className={`w-[97] flex-row justify-center rounded-lg border bg-button px-[8] py-[2] ${showFavs ? 'border-red-700 bg-button' : 'bg-buttondarker'}`}>
              <Text
                className={`${showFavs ? 'text-buttondarkertext' : 'text-buttondarkertext'} font-semibold`}>
                {showFavs ? 'Show All' : 'Show Favs'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <SectionList<Episode, SeasonsSection>
        ref={sectionListRef}
        sections={sections as any}
        stickySectionHeadersEnabled={true}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader as any}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 115 }}
        // style={{ width: '100%', paddingBottom: 105, height: '100%' }}
        getItemLayout={buildGetItemLayout as any}
        //optimizations 06/29/2025
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
      />
    </View>
  );
};

export default memo(SeasonEpisodeList);
