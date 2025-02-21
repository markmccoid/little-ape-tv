import React, { useReducer, useState } from 'react';
import { View, Text, LayoutAnimation, TouchableOpacity, Pressable } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';

type Props = {
  tagId: string;
  state: 'off' | 'include' | 'exclude';
  onToggleTag: (tagId: string, newState: Props['state']) => void;
  onLongPress?: (tagId: string, newState: Props['state']) => void;
  tagName: string;
  size: string;
};

const cycleState = (state: Props['state']): Props['state'] => {
  switch (state) {
    case 'include':
      return 'exclude';
    case 'exclude':
      return 'off';
    case 'off':
      return 'include';
    default:
      return 'off';
  }
};
export const GenreItem = ({
  tagId,
  state,
  onToggleTag,
  onLongPress,
  tagName,
  size = 's',
}: Props) => {
  const { colors } = useCustomTheme();
  const [localState, setLocalState] = useState(state);
  const bgColor =
    localState === 'include' ? 'green' : localState === 'exclude' ? colors.deleteRed : 'white';
  const fgColor = localState === 'exclude' ? 'white' : 'black';

  // Using localState so updates are optimistic
  React.useEffect(() => {
    setLocalState(state);
  }, [state]);

  const handleStateChange = (tagId: string) => {
    const prevState = localState;
    const newState = cycleState(localState);
    setLocalState(newState);

    setTimeout(() => {
      try {
        onToggleTag(tagId, newState);
      } catch (error) {
        console.log('Error setting Genre Tag');
        setLocalState(prevState);
      }
    }, 0);
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
      className="m-[5] border border-border px-[7] py-[1] text-center"
      style={{ backgroundColor: bgColor, borderRadius: 10 }}
      key={tagId}
      onPress={() => handleStateChange(tagId)}
      //isSelected={isSelected} //used in styled components
    >
      <View className="flex-row items-center">
        <SymbolView
          name={localState === 'exclude' ? 'theatermasks.fill' : 'theatermasks'}
          size={size === 's' ? 22 : 30}
          tintColor={localState === 'exclude' ? 'white' : 'black'}
        />
        <Text className="pl-1" style={{ fontSize: 15, color: fgColor }}>
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
