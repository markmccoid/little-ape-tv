import { View, Text, TextInput, Alert, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { tags$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';
import Sortable, { SortableGridRenderItem } from 'react-native-sortables';
import { Tag } from '~/store/functions-tags';
import { useCustomTheme } from '~/utils/customColorTheme';
import showConfirmationPrompt from '~/components/common/showConfirmationPrompt';
import TagItem from './TagItem';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TagContainer = () => {
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const { bottom } = useSafeAreaInsets();
  const tags = use$(tags$.tagList);
  const { colors } = useCustomTheme();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      scrollableRef.current?.scrollToEnd({ animated: true });
    }, 300); // Slightly longer delay to ensure UI update
  }, []);
  // const scrollToEnd = useCallback(() => {
  //   // scrollableRef.current?.scrollToEnd({ animated: true });
  //   const y = tags.length * 55;
  //   // scrollableRef.current?.scrollTo({ y, animated: true });
  //   setTimeout(() => scrollableRef.current?.scrollTo({ y, animated: true }), 100);
  // }, [tags]);
  const handleNewTagPrompt = () => {
    Alert.prompt(
      'Enter New Tag',
      "If it is not unique, it won't be added",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (name) => {
            if (name) {
              try {
                tags$.addTag(name);
                scrollToEnd();
              } catch (e: any) {
                // Checking for custom error being thrown
                if (e?.message?.includes('duplicate')) {
                  Alert.alert('Duplicate Tag', 'Tag Already Exists, nothing added');
                }
              }
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const renderItem = useCallback<SortableGridRenderItem<Tag>>(
    ({ item }) => <TagItem key={item.id} tagItem={item} />,
    []
  );
  return (
    <View className="mx-2 flex-1">
      <View className="my-2 flex-row items-center">
        {/* <Text>TagContainer</Text> */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleNewTagPrompt();
          }}
          className="flex-row items-center rounded-full border-hairline px-4 py-2.5 active:opacity-80"
          style={{
            backgroundColor: colors.primary + '44',
            borderColor: colors.primary,
          }}
          accessibilityLabel="Add a new tag">
          <SymbolView name="plus" tintColor={colors.primary} size={16} style={{ marginRight: 6 }} />
          <Text className="font-medium text-primary">Add A New Tag</Text>
        </Pressable>
      </View>
      <Animated.ScrollView
        contentContainerStyle={{ padding: 10 }}
        ref={scrollableRef}
        style={{ flex: 1, marginBottom: bottom }}>
        <Sortable.Grid
          columns={1}
          data={tags}
          renderItem={renderItem}
          rowGap={4}
          columnGap={10}
          onDragEnd={(parms) => tags$.updateTagPositions(parms.indexToKey)}
          enableActiveItemSnap={false}
          activeItemScale={0.95}
          // showDropIndicator
          // itemEntering={BounceInRight}
          hapticsEnabled={true}
          scrollableRef={scrollableRef}
        />
      </Animated.ScrollView>
    </View>
  );
};

export default TagContainer;
