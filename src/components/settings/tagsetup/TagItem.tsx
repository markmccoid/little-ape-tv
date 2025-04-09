import { View, Text, Alert } from 'react-native';
import React from 'react';
import { Tag } from '~/store/functions-tags';
import showConfirmationPrompt from '~/components/common/showConfirmationPrompt';
import { tags$ } from '~/store/store-shows';
import Sortable from 'react-native-sortables';
import { DeleteIcon, EditIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';

const handleEditTagPrompt = (tag: Tag) => {
  Alert.prompt(
    'Enter New Tag Value',
    'Edit Existing Tag',
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
              tags$.editTag(tag.id, name);
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
    tag.name,
    'default'
  );
};

const handleTagRemove = async (tagId: string) => {
  // Alert.alert("Need to add confirmation as well as removing from existing Movies");

  try {
    const yesDelete = await showConfirmationPrompt(
      'Delete Tag?',
      'Deleting this Tag will remove it from all Shows. Are you sure?'
    );
    if (yesDelete) {
      tags$.removeTag(tagId);
    }
  } catch (error) {
    console.error('Delete operation failed:', error);
  }
};
const TagItem = ({ tagItem }: { tagItem: Tag }) => {
  const { colors } = useCustomTheme();

  return (
    <View className="flex-row items-center rounded-xl border-hairline border-gray-400 bg-white p-2">
      <View className="mr-2 flex-grow ">
        <Text className="text-lg">{tagItem.name}</Text>
      </View>
      <Sortable.Pressable onPress={() => handleEditTagPrompt(tagItem)} className="mx-1">
        <EditIcon size={20} color={colors.primary} />
      </Sortable.Pressable>
      <Sortable.Pressable onPress={() => handleTagRemove(tagItem.id)} className="mx-1">
        <DeleteIcon size={20} />
      </Sortable.Pressable>
    </View>
  );
};

export default TagItem;
