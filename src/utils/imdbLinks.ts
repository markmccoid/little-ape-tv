import { Linking } from 'react-native';
import { getEpisodeIMDBURL } from '~/data/query.shows';

//Open the IMDB app to the season/episode
export const imdbLinkToEpisode = async (
  showId: string,
  seasonNumber: number,
  episodeNumber: number
) => {
  const { imdbId } = await getEpisodeIMDBURL(parseInt(showId), seasonNumber, episodeNumber);
  if (imdbId === null) {
    return null;
  }
  Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
    Linking.openURL(`https://www.imdb.com/title/${imdbId}/`);
  });
};
