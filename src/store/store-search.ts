import { observable } from '@legendapp/state';

type SearchType = 'title' | 'person';
type Search = { searchVal: string; searchType: SearchType };

//~ --------------------------------------------------------
//~ Search for shows.  not saved, just used for search
//~ used in /data/query.search.ts
//~ --------------------------------------------------------
export const search$ = observable<Search>({ searchVal: '', searchType: 'title' });
