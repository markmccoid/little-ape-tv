import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { SymbolView } from 'expo-symbols';
import { savedShows$ } from '~/store/store-shows';
import showConfirmationPrompt from '~/components/common/showConfirmationPrompt';
import { useCustomTheme } from '~/utils/customColorTheme';

const DeleteShowButton = ({ showId }: { showId: string }) => {
  const { colors } = useCustomTheme();
  const onRemoveShow = async () => {
    const onDelete = await showConfirmationPrompt(
      'Delete Show',
      'Are you sure you want to delete this show?'
    );
    if (onDelete) {
      savedShows$.removeShow(showId);
    }
  };
  return (
    <Pressable
      onPress={onRemoveShow}
      className="h-[35] w-[35] items-center justify-center rounded-full">
      <View
        className="items-center justify-center rounded-full bg-white"
        style={[{ width: 20, height: 20 }]}>
        <SymbolView name="minus.circle.fill" tintColor={colors.deleteRed} size={35} />
      </View>
    </Pressable>
  );
};

export default DeleteShowButton;
