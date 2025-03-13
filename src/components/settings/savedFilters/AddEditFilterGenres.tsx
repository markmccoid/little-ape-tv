import { View, Text } from 'react-native';
import React from 'react';
import GenreCloudEnhanced, { GenreItem } from '~/components/common/TagCloud/GenreCloudEnhanced';
import { use$ } from '@legendapp/state/react';
import { genres$ } from '~/store/store-genres';
import { TagStateArrays } from './useTagManagement';

// Sets up the state of the tags.  If editing a filter, it will merge the tags with the filter's tags
// otherwise it will just set the tags to "off"
const mergeGenres = (
  genres: string[],
  initGenres: TagStateArrays | undefined
): { name: string; state: 'off' | 'include' | 'exclude' }[] => {
  return genres.map((genre) => {
    let state: 'include' | 'exclude' | 'off' = 'off';
    if (!initGenres) {
      return {
        name: genre,
        state: state,
      };
    }
    if (initGenres.includedTags.includes(genre)) {
      state = 'include';
    } else if (initGenres.excludedTags.includes(genre)) {
      state = 'exclude';
    }
    return {
      name: genre,
      state: state,
    };
  });
};

type Props = {
  genreFunctions: {
    addIncludedTag: (tag: string) => void;
    removeIncludedTag: (tag: string) => void;
    addExcludedTag: (tag: string) => void;
    removeExcludedTag: (tag: string) => void;
  };
  genreStateArrays?: TagStateArrays;
};

const AddEditFilterGenres = ({ genreFunctions, genreStateArrays }: Props) => {
  const genres = use$(genres$.genreList);
  const mappedGenres = mergeGenres(genres, genreStateArrays);

  const handleToggleGenre = (genre: string, newGenreState: 'include' | 'exclude' | 'off') => {
    console.log('HANDLE Toggle', genre, newGenreState);
    if (newGenreState === 'include') genreFunctions.addIncludedTag(genre);
    if (newGenreState === 'exclude') genreFunctions.addExcludedTag(genre);
    if (newGenreState === 'off') {
      genreFunctions.removeIncludedTag(genre);
      genreFunctions.removeExcludedTag(genre);
    }
  };

  return (
    <View>
      <GenreCloudEnhanced>
        {mappedGenres.map((genre) => (
          <GenreItem
            key={genre.name}
            tagId={genre.name}
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

export default AddEditFilterGenres;
