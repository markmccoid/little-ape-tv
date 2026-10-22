import {
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  Modal,
  ScrollView,
} from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import ScreenTwoTagCloud from './ScreenTwoTagCloud';
import { replaceShowTags, updateShowUserRating } from '~/data/actions.savedShows';
import { useMatchedTags } from '~/data/query.savedShows';
import type { ShowListItem } from '~/db/showList';
import { SymbolView } from 'expo-symbols';
import ShadowBackground from '~/components/common/ShadowBackground';
import { MenuItem, UserRatingDetailScreen } from '../../details/userRating/UserRatingDetailScreen';
import { Ruler } from '../../details/userRating/UserRatingRuler';
import UserRatingDetailScreenRuler from '../../details/userRating/UserRatingDetailScreenRuler';

interface TagRatingEditModalProps {
  show: ShowListItem;
}
const TagRatingEditModal = ({ show }: TagRatingEditModalProps) => {
  const showId = show.id;
  const [isVisible, toggleVisible] = useReducer((prev) => !prev, false);
  const userRating = show.userRating;
  const userTags = show.tagIds;
  const [pendingUserRating, setPendingUserRating] = useState(userRating || 0);
  const [pendingTags, setPendingTags] = useState(userTags || []);
  const pendingMatchedTags = useMatchedTags(pendingTags);
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
    // console.log('Saving Tags and User Rating', pendingTags);
    replaceShowTags(showId, pendingTags);
    updateShowUserRating(showId, pendingUserRating);
    toggleVisible();
  }, [pendingTags, pendingUserRating]);

  return (
    <View className="my-2">
      <Pressable className="rounded-lg border-hairline px-2 py-2" onPress={toggleVisible}>
        <ShadowBackground opacity={0.7} />
        {pendingTags.length > 0 ? (
          <View>
            {/* View of Selected Tags */}
            <View className="flex-row flex-wrap gap-[3]">
              {pendingMatchedTags
                .filter((tag) => tag.state === 'include')
                .map((tag) => (
                  <View className="rounded-sm border-hairline bg-green-300 p-[2]" key={tag.id}>
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
      {/* MODAL START */}
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View className="h-full items-center justify-center ">
          <Pressable
            onPress={() => {
              handleModalClose();
            }}
            style={{
              ...StyleSheet.absoluteFill,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <View className="h-1/2 w-[300] rounded-lg border-hairline border-primary bg-white p-2">
            <ScrollView>
              {/* USER RATING UPDATE */}
              <View className="flex-col items-center justify-center rounded-lg border-hairline border-primary py-2">
                <Text className="text-xl font-semibold">User Rating</Text>
                <View className="flex-row ">
                  <UserRatingDetailScreenRuler
                    fadeColor="#E2BE3E"
                    rulerWidth={300}
                    ratingWheelLocked={true}
                    onChange={(value) => {
                      setPendingUserRating(value);
                    }}
                    startingTick={pendingUserRating}
                  />
                </View>
              </View>
              {/* TAGS UPDATE */}
              <View className="mb-5 rounded-lg border-hairline py-2">
                <ScreenTwoTagCloud initialTagIds={userTags} handlePendingTags={handlePendingTags} />
              </View>
              <View className="mt-5 flex-row justify-end">
                <Pressable
                  onPress={() => {
                    handleModalClose();
                  }}
                  className="rounded-lg border-hairline bg-button px-2 py-1">
                  <Text className="font-semibold text-buttontext">Done</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default TagRatingEditModal;
