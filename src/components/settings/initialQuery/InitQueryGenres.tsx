import { View, Text } from 'react-native';
import React, { useMemo } from 'react';
import ShadowBackground from '~/components/common/ShadowBackground';
import { useAllGenres } from '~/data/query.search';
import GenreCloudEnhanced, { GenreItem } from '~/components/common/TagCloud/GenreCloudEnhanced';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import InfoPopup from '~/components/common/InfoPopup';

// Sets up the state of the tags.  If editing a filter, it will merge the tags with the filter's tags
// otherwise it will just set the tags to "off"
type GenreObj = { id: string; name: string };
const mergeGenres = (
  genres: GenreObj[],
  includeGenres: string[] | undefined,
  excludeGenres: string[] | undefined
): { id: string; name: string; state: 'off' | 'include' | 'exclude' }[] => {
  return genres.map((genre) => {
    let state: 'off' | 'include' | 'exclude' = 'off';

    if (includeGenres?.includes(genre.id)) {
      state = 'include';
    } else if (excludeGenres?.includes(genre.id)) {
      state = 'exclude';
    }

    return {
      id: genre.id,
      name: genre.name,
      state,
    };
  });
};

const InitQueryGenres = ({ invalidateQuery }: { invalidateQuery: () => void }) => {
  const genres = useAllGenres();
  const includeGenres = use$(settings$.initialQuery.includeGenres) || [];
  const excludeGenres = use$(settings$.initialQuery.excludeGenres) || [];

  const mappedGenres = useMemo(
    () => mergeGenres(genres, includeGenres, excludeGenres),
    [genres, includeGenres, excludeGenres]
  );

  const handleToggleGenre = (genreId: string, newGenreState: 'include' | 'exclude' | 'off') => {
    if (newGenreState === 'include') {
      settings$.initialQuery.includeGenres.set([...includeGenres, genreId]);
      const newExclude = excludeGenres.filter((el) => el !== genreId);
      settings$.initialQuery.excludeGenres.set([...newExclude]);
    }
    if (newGenreState === 'exclude') {
      settings$.initialQuery.excludeGenres.set([...excludeGenres, genreId]);
      const newInclude = includeGenres.filter((el) => el !== genreId);
      settings$.initialQuery.includeGenres.set([...newInclude]);
    }
    if (newGenreState === 'off') {
      const newInclude = includeGenres.filter((el) => el !== genreId);
      settings$.initialQuery.includeGenres.set([...newInclude]);
      const newExclude = excludeGenres.filter((el) => el !== genreId);
      settings$.initialQuery.excludeGenres.set([...newExclude]);
    }
    invalidateQuery();
  };

  return (
    <View className="mt-2 flex-col items-center justify-between gap-2 rounded-md border-hairline bg-slate-200 p-2">
      <ShadowBackground />
      <View className="flex-row gap-3">
        <Text className="font-Roboto-500 text-xl">Genres</Text>
        <InfoPopup
          title="Search Genres"
          infoText={`You can choose which filters to inlcude or exclude in your intial search.  NOTE: Clear all to not filter by Genre on the initial search.`}
        />
      </View>
      {/* {genres.map((genre) => {
        return (
          <View key={genre.id}>
            <Text>{genre.name}</Text>
          </View>
        );
      })} */}
      <GenreCloudEnhanced>
        {mappedGenres.map((genre) => (
          <GenreItem
            key={genre.name}
            tagId={genre.id}
            tagName={genre.name}
            size="s"
            state={genre.state}
            onLongPress={handleToggleGenre}
            onToggleTag={handleToggleGenre}
            // type="threestate"
          />
        ))}
      </GenreCloudEnhanced>
    </View>
  );
};

export default InitQueryGenres;
