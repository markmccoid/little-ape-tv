import { View, Text, Alert, Pressable } from 'react-native';
import React from 'react';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
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
    <View className="mb-[1] h-[45] flex-row items-center justify-between overflow-hidden rounded-lg border-hairline bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <View className="flex-1">
        <Text className="text-xl font-medium text-text dark:text-white">{tagItem.name}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleEditTagPrompt(tagItem);
          }}
          className="rounded-full border-hairline p-2 active:opacity-70"
          style={{
            backgroundColor: colors.primary + '10',
            borderColor: colors.border,
          }}
          accessibilityLabel={`Edit tag ${tagItem.name}`}>
          <SymbolView name="pencil" tintColor={colors.primary} size={18} />
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleTagRemove(tagItem.id);
          }}
          className="rounded-full border-hairline p-2 active:opacity-70"
          style={{
            backgroundColor: colors.deleteRed + '10',
            borderColor: colors.border,
          }}
          accessibilityLabel={`Delete tag ${tagItem.name}`}>
          <SymbolView name="trash" tintColor={colors.deleteRed} size={18} />
        </Pressable>
      </View>
    </View>
  );
};

export default TagItem;
