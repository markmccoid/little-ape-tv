import { View, Text, TextInput, Alert, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { tags$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';
import Sortable, { SortableGridRenderItem } from 'react-native-sortables';
import { Tag } from '~/store/functions-tags';
import { useCustomTheme } from '~/utils/customColorTheme';
import showConfirmationPrompt from '~/components/common/showConfirmationPrompt';
import TagItem from './TagItem';

const TagContainer = () => {
  const [newTag, setNewTag] = useState('');
  const tags = use$(tags$.tagList);
  const { colors } = useCustomTheme();
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
              } catch (e) {
                // Checking for custom error being thrown
                if (e.message.includes('duplicate')) {
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
    <View className="mx-2">
      <View className="my-2 flex-row items-center">
        {/* <Text>TagContainer</Text> */}
        <Pressable onPress={handleNewTagPrompt} className="rounded-md bg-button px-2 py-2">
          <Text className="text-lg text-white">Add A New Tag</Text>
        </Pressable>
      </View>
      <Sortable.Grid
        columns={1}
        data={tags}
        renderItem={renderItem}
        rowGap={10}
        columnGap={10}
        onDragEnd={(parms) => tags$.updateTagPositions(parms.indexToKey)}
        enableActiveItemSnap={false}
        activeItemScale={0.95}
        // showDropIndicator
        // itemEntering={BounceInRight}
        hapticsEnabled={true}
      />
    </View>
  );
};

export default TagContainer;
