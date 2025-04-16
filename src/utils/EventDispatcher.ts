/**
 * eventBus.ts
 * Facilitates decoupled communication between modules with typed async callbacks
 */

import { TVShowDetails } from '@markmccoid/tmdb_api';

export enum EventName {
  TagSearchResults = 'TAG_SEARCH_RESULTS',
  ClearSearchStores = 'CLEAR_SEARCH_STORES',
  FetchShowColors = 'FETCH_SHOW_COLORS',
  UpdateShowProviders = 'UPDATE_SHOW_PROVIDERS',
  GenerateGenresArray = 'GENERATE_GENRES_ARRAY',
  AppInitialized = 'APP_INITIALIZED',
  UpdateSavedShowDetail = 'UPDATE_SAVED_SHOW_DETAIL',
  UpdateAvgEpisodeRuntime = 'UPDATE_AVG_EPISODE_RUNTIME', // Added your event
  UpdateSeasonSummary = 'UPDATE_SEASON_SUMMARY',
}

// Define payload types for each event
interface EventPayloads {
  [EventName.TagSearchResults]: [results: string[]];
  [EventName.ClearSearchStores]: [];
  [EventName.FetchShowColors]: [data: string];
  [EventName.UpdateShowProviders]: [providers: string[]];
  [EventName.GenerateGenresArray]: [genres: string[]];
  [EventName.AppInitialized]: [];
  [EventName.UpdateSavedShowDetail]: [showId: string, showDetail: TVShowDetails]; // Define payload for your event
  [EventName.UpdateAvgEpisodeRuntime]: [showId: string, seasonsArray: number[]]; // Define payload for your event
  [EventName.UpdateSeasonSummary]: [showId: string, seasonsArray: number[]]; // Define payload for your event
}

// Type for callbacks, tied to event payloads
type EventCallback<T extends EventName> = (...args: EventPayloads[T]) => void | Promise<void>;

class EventDispatcher {
  private subscribers: Map<EventName, EventCallback<any>[]>;

  constructor() {
    this.subscribers = new Map();
  }

  on<T extends EventName>(event: T, callback: EventCallback<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    const callbacks = this.subscribers.get(event)! as EventCallback<T>[];
    callbacks.push(callback);

    return () => this.off(event, callback);
  }

  off<T extends EventName>(event: T, callback: EventCallback<T>): void {
    const callbacks = this.subscribers.get(event) as EventCallback<T>[] | undefined;
    if (callbacks) {
      const filtered = callbacks.filter((cb) => cb !== callback);
      this.subscribers.set(event, filtered);
    }
  }

  async emit<T extends EventName>(event: T, ...args: EventPayloads[T]): Promise<void> {
    const callbacks = this.subscribers.get(event) as EventCallback<T>[] | undefined;
    if (!callbacks || callbacks.length === 0) {
      return;
    }

    await Promise.resolve().then(async () => {
      for (const callback of callbacks) {
        try {
          const result = callback(...args);
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      }
    });
  }

  clear(event: EventName): void {
    this.subscribers.delete(event);
  }
}

export const eventDispatcher = new EventDispatcher();
