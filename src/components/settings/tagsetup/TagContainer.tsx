import { View, Text, TextInput, Alert, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { tags$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';
import Sortable, { SortableGridRenderItem } from 'react-native-sortables';
import { Tag } from '~/store/functions-tags';
import { DeleteIcon } from '~/components/common/Icons';

const TagContainer = () => {
  const [newTag, setNewTag] = useState('');
  const tags = use$(tags$.tagList);
  console.log(tags);
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
              console.log('NAME', name);
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

  const updateTagPositions = (tags: Tag[], sortedIds: string[]) => {
    const updatedTags = sortedIds
      .map((id, index) => {
        const tag = tags.find((tag) => tag.id === id);
        if (tag) {
          return { ...tag, position: index + 1 }; // Update position (starting from 1)
        } else {
          console.warn(`Tag with ID ${id} not found in the original tags array.`);
          return null; // Or handle the missing tag as appropriate for your application
        }
      })
      .filter((tag) => tag !== null); // Remove any nulls caused by missing IDs

    return updatedTags;
  };
  const renderItem = useCallback<SortableGridRenderItem<Tag>>(({ item }) => {
    return (
      <View className="flex-row items-center justify-between rounded-xl border bg-green-500 p-2">
        <Text>{item.name}</Text>
        <Sortable.Pressable onPress={() => tags$.removeTag(item.id)}>
          <DeleteIcon size={20} />
        </Sortable.Pressable>
      </View>
    );
  }, []);
  return (
    <View>
      <Text>TagContainer</Text>
      <Pressable onPress={handleNewTagPrompt}>
        <Text>ADD TAG</Text>
      </Pressable>
      <Sortable.Grid
        columns={1}
        data={tags}
        renderItem={renderItem}
        rowGap={10}
        columnGap={10}
        onDragEnd={(parms) => tags$.updateTagPositions(parms.indexToKey)}
        // showDropIndicator
      />
    </View>
  );
};

export default TagContainer;
