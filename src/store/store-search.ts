import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { createAndPersistObservable } from './createPersistedStore';
import { observable } from '@legendapp/state';

type SearchType = 'title' | 'person';
type Search = { searchVal: string; searchType: SearchType };

export const search$ = observable<Search>({ searchVal: '', searchType: 'title' });
