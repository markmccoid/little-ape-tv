import React, { startTransition, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, View, Text, InteractionManager } from 'react-native';
import showConfirmationPrompt from '@/components/common/showConfirmationPrompt';

import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';
import { savedShows$ } from '~/store/store-shows';
type Props = {
  showId: string | undefined;
};

const ShowDeleteButton = ({ showId }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useCustomTheme();
  const router = useRouter();

  const handleDelete = async () => {
    if (!showId) return;
    try {
      const yesDelete = await showConfirmationPrompt('Delete Show', 'Delete Show');

      if (yesDelete && showId) {
        setIsProcessing(true);
        savedShows$.removeShow(showId);
        // Navigate back to the desired screen
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
    } finally {
      setIsProcessing(false);
      // If we are deep in a stack go back to starting point
      router.dismissAll();
      // InteractionManager.runAfterInteractions(() => eventBus.publish('TAG_SEARCH_RESULTS'));
    }
  };

  return (
    <>
      {isProcessing && <ActivityIndicator size="small" />}

      {!isProcessing && (
        <TouchableOpacity
          disabled={isProcessing}
          onPress={handleDelete}
          className={`mr-[-10] flex flex-row items-center px-2 pl-1 ${
            isProcessing ? 'opacity-50' : ''
          }`}>
          <SymbolView name="trash" tintColor={colors.deleteRed} size={30} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShowDeleteButton;
