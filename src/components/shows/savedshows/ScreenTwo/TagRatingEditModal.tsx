import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Modal } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import ScreenTwoTagCloud from './ScreenTwoTagCloud';
import { observable } from '@legendapp/state';
import { savedShows$, tags$ } from '~/store/store-shows';
import { SymbolView } from 'expo-symbols';
import ShadowBackground from '~/components/common/ShadowBackground';
import { use$ } from '@legendapp/state/react';

interface TagRatingEditModalProps {
  showId: string;
}
const TagRatingEditModal = ({ showId }: TagRatingEditModalProps) => {
  const [isVisible, toggleVisible] = useReducer((prev) => !prev, false);
  const userRating = use$(savedShows$.shows[showId].userRating);
  const userTags = use$(savedShows$.shows[showId].userTags);
  const [pendingUserRating, setPendingUserRating] = useState(userRating || 0);
  const [pendingTags, setPendingTags] = useState(userTags || []);
  const handlePendingTags = (tags: any) => {
    setPendingTags(tags);
  };

  // Keep pending in sync with outside changes to tags and ratings
  useEffect(() => {
    setPendingUserRating(userRating || 0);
    setPendingTags(userTags || []);
  }, [userRating, userTags]);

  const handleModalClose = useCallback(() => {
    // Save Tags and User Rating before hiding modal.
    console.log('Saving Tags and User Rating', pendingTags);
    savedShows$.shows[showId].userTags.set(pendingTags);
    toggleVisible();
  }, [pendingTags]);

  return (
    <View className="my-2">
      <Pressable className="rounded-lg border-hairline px-2 py-2" onPress={toggleVisible}>
        <ShadowBackground opacity={0.7} />
        {pendingTags.length > 0 ? (
          <View>
            <View className="flex-row flex-wrap gap-[3]">
              {tags$
                .matchTagIds(pendingTags)
                .filter((tag) => tag.state === 'include')
                .map((tag) => (
                  <View className="rounded-sm border-hairline bg-green-300 p-[2]">
                    <Text key={tag.id} className="text-xs text-black">
                      {tag.name}
                    </Text>
                  </View>
                ))}
            </View>
            <Text className="text-sm">User Rating: {pendingUserRating}</Text>
          </View>
        ) : (
          <View className="flex-col justify-center ">
            {/* <SymbolView name="tag" size={20} tintColor="#000" /> */}
            <Text className="text-sm text-black">No Tags</Text>
            <Text className="text-sm">User Rating: {pendingUserRating}</Text>
          </View>
        )}
      </Pressable>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View className="h-full items-center justify-center ">
          <Pressable
            onPress={() => {
              handleModalClose();
            }}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <View className="h-1/2 w-3/4 rounded-lg border-hairline border-primary bg-white p-2">
            <ScreenTwoTagCloud showId={showId} handlePendingTags={handlePendingTags} />
            <View className="flex-row justify-end">
              <Pressable
                onPress={() => {
                  handleModalClose();
                }}
                className="rounded-lg border-hairline bg-button px-2 py-1">
                <Text className="font-semibold text-buttontext">Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default TagRatingEditModal;
