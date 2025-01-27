import { tvSearchByTitle } from '@markmccoid/tmdb_api';
import { useQuery } from '@tanstack/react-query';

const searchByTitle = async (title: string) => {
  return useQuery({
    queryKey: ['searchByTitle', title],
    queryFn: async () => {
      return await tvSearchByTitle(title);
    },
  });
};
