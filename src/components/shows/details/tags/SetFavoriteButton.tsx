import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { savedShows$ } from '~/store/store-shows';
import { MotiView } from 'moti';
import { SymbolView } from 'expo-symbols';
import { SavedShow } from '~/store/functions-shows';
import { useCustomTheme } from '~/utils/customColorTheme';

type Props = {
  showId: string;
  isDisplayed?: boolean;
  isFavorited: boolean;
};
const SetFavoriteButton = ({ showId, isDisplayed = true, isFavorited }: Props) => {
  const { colors } = useCustomTheme();
  const [isFavoritedLocal, setIsFavoritedLocal] = useState(isFavorited);

  useEffect(() => {
    setIsFavoritedLocal(isFavorited);
  }, [isFavorited]);

  return (
    <Pressable
      onPress={() => {
        setIsFavoritedLocal((prev) => !prev);
        setTimeout(() => savedShows$.toggleFavoriteShow(showId, 'toggle'), 0);
      }}
      className={`${isDisplayed ? 'pointer-events-auto' : 'pointer-events-none opacity-0'} `}>
      <MotiView
        key="A"
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isDisplayed ? 100 : 0, scale: isDisplayed ? 1 : 0 }}
        transition={{ type: 'timing', duration: 500 }}
        exit={{ opacity: 0 }}>
        <SymbolView
          name="heart.circle.fill"
          type="palette"
          colors={[isFavoritedLocal ? 'red' : 'white', colors.primary]}
          size={35}
          style={{ opacity: isFavoritedLocal ? 1 : 0.5 }}
        />
      </MotiView>
    </Pressable>
  );
};

export default SetFavoriteButton;
