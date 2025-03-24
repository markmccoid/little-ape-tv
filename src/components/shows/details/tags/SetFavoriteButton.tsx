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
        from={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        // animate={{ opacity: isDisplayed ? 1 : 0, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
        exit={{ opacity: 0 }}>
        <SymbolView
          name="heart.circle.fill"
          type="palette"
          colors={[isFavoritedLocal ? 'red' : 'white', colors.primary]}
          size={35}
          style={{ opacity: isFavoritedLocal ? 1 : 1 }}
        />
      </MotiView>
    </Pressable>
  );
};

export default SetFavoriteButton;
