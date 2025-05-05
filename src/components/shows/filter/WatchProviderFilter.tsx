import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { settings$ } from '~/store/store-settings';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';
import { SymbolView } from 'expo-symbols';

const WatchProviderFilter = () => {
  const providers = settings$.savedStreamingProviders.peek();
  const currentFilter = use$(filterCriteria$.baseFilters.includeWatchProviders);

  return (
    <View className="mx-2 rounded-xl border-hairline border-border bg-card px-2 py-1">
      <View className=" flex-row justify-between">
        <Text className="text-xl font-semibold">Stream Provider Filter</Text>
        {/* <Pressable onPress={filterCriteria$.actionClearGenres} className="px-2">
          <EraserIcon />
        </Pressable> */}
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        {providers.length > 0 &&
          providers.map((el) => {
            const active = currentFilter?.includes(el.providerId.toString());
            return (
              <Pressable
                key={el.providerId}
                className="flex-col items-center gap-2 rounded-lg p-2"
                style={{ borderColor: active ? 'red' : 'white', borderWidth: 1 }}
                onPress={() =>
                  filterCriteria$.baseFilters.includeWatchProviders.set([
                    ...(currentFilter || []),
                    el.providerId.toString(),
                  ])
                }>
                {active && (
                  <View className="absolute right-0 top-0 z-10">
                    <SymbolView
                      type="palette"
                      name="checkmark.square.fill"
                      // tintColor="green"
                      colors={['white', 'green']}
                      size={25}
                    />
                  </View>
                )}
                <Image source={el.logoURL} style={{ width: 50, height: 50, borderRadius: 10 }} />
                {/* <Text>{el.provider}</Text> */}
              </Pressable>
            );
          })}
      </View>
      {/* <GenreCloudEnhanced>
        {genreList.map((genre) => (
          <GenreItem
            size="sm"
            tagId={genre.genre}
            tagName={genre.genre}
            onToggleTag={(genre, newState) => fcUpdateTagsGenres(genre, newState, 'genres')}
            state={genre.state}
            onLongPress={(genre, newState) => fcUpdateTagsGenres(genre, newState, 'genres')}
            // type="threestate"
            key={genre.genre}
          />
        ))}
      </GenreCloudEnhanced> */}
    </View>
  );
};

export default WatchProviderFilter;
