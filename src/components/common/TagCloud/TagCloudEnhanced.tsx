import React, { useReducer, useState } from 'react';
import { View, Text, LayoutAnimation, TouchableOpacity, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { UnTagIcon } from '../Icons';

type Props = {
  tagId: string;
  state: 'off' | 'include' | 'exclude';
  onToggleTag: (tagId: string, newState: Props['state']) => void;
  onLongPress?: (tagId: string, newState: Props['state']) => void;
  tagName: string;
  size: string;
  type: 'boolean' | 'threestate';
};
const cycleState = (state: Props['state'], type: Props['type']): Props['state'] => {
  switch (state) {
    case 'include':
      if (type === 'boolean') {
        return 'off';
      }
      return 'exclude';
    case 'exclude':
      return 'off';
    case 'off':
      return 'include';
    default:
      return 'off';
  }
};
export const TagItem = ({
  tagId,
  state,
  onToggleTag,
  onLongPress,
  tagName,
  size = 's',
  type = 'threestate',
}: Props) => {
  const { colors } = useCustomTheme();

  const [localState, setLocalState] = useState(state);
  const [isProcessing, setIsProcessing] = useState(false);
  const bgColor =
    localState === 'include'
      ? colors.tagInclude
      : localState === 'exclude'
        ? colors.tagExclude
        : 'white';
  const fgColor =
    localState === 'exclude'
      ? colors.tagExcludeText
      : localState === 'include'
        ? colors.tagIncludeText
        : 'black';

  const fontSize = size === 'xs' ? 12 : size === 's' ? 15 : 18;
  const iconSize = size === 'xs' ? 12 : size === 's' ? 15 : 20;
  const yPadding = size === 'xs' ? 3 : size === 's' ? 5 : 5;
  const xPadding = size === 'xs' ? 5 : size === 's' ? 7 : 7;
  const margin = size === 'xs' ? 2 : size === 's' ? 3 : 5;

  // Using localState so updates are optimistic
  React.useEffect(() => {
    setLocalState(state);
  }, [state]);

  const handleStateChange = (tagId: string) => {
    const prevState = localState;
    setIsProcessing(true);
    const newState = cycleState(localState, type);
    setLocalState(newState);

    setTimeout(() => {
      try {
        onToggleTag(tagId, newState);
      } catch (error) {
        console.log('Error setting Genre Tag');
        setLocalState(prevState);
      }
    }, 0);
    setTimeout(() => setIsProcessing(false), 0);
  };

  const handleLongPress = (tagId: string) => {
    // Long press -> allows user to long press to get to exclude
    // any other state other than "off" will be turned to "off"
    // "off" -> "exclude"
    // "exclude" => "off"
    // "include" => "off"
    if (!onLongPress) return;
    if (localState === 'off') {
      setLocalState('exclude');
      onLongPress(tagId, 'exclude');
    } else {
      setLocalState('off');
      onLongPress(tagId, 'off');
    }
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress ? () => handleLongPress(tagId) : undefined}
      activeOpacity={0.8}
      className="border border-border text-center"
      // className="border border-border py-[5] px-[7] m-[5] text-center"
      style={{
        backgroundColor: bgColor,
        borderRadius: 10,
        paddingVertical: yPadding,
        paddingHorizontal: xPadding,
        margin: margin,
      }}
      key={tagId}
      disabled={isProcessing}
      onPress={() => handleStateChange(tagId)}
      // onPress={() => onToggleTag(tagId)}
      //isSelected={isSelected} //used in styled components
    >
      <View className="flex-row items-center">
        {localState === 'exclude' ? (
          <UnTagIcon size={iconSize} color="white" style={{ paddingRight: 5 }} />
        ) : (
          <AntDesign
            style={{ paddingRight: 5 }}
            name={localState !== 'off' ? 'tag' : 'tago'}
            size={iconSize}
            color={fgColor}
          />
        )}
        <Text
          style={{
            fontSize: fontSize,
            color: fgColor,
            fontWeight: localState === 'off' ? '400' : '400',
          }}>
          {tagName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TagCloudEnhanced = ({ children }) => {
  return <View className="flex-row flex-wrap justify-center">{children}</View>;
};

export default TagCloudEnhanced;

/*
Usage Example:
  <TagCloudEnhanced>
        {mergedTags.map((tag) => (
          <TagItemEnhanced
            key={tag.id}
            tagId={tag.id}
            tagName={tag.name}
            size="s"
            state={tag.state}
            onToggleTag={handleTagSelect(tag.state)}
            onLongPress={handleLongPress(tag.state)}
          />
        ))}
  </TagCloudEnhanced>
--------
  The state can be "off", "include" or "exclude"
  If you are just doing on/off style, the just map to "off" and "include"
*/
