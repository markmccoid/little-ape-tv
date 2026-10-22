import { View, Text } from 'react-native';
import React from 'react';
import { useMatchedTags } from '~/data/query.savedShows';
import TagCloudEnhanced, { TagItem } from '~/components/common/TagCloud/TagCloudEnhanced';

type Props = {
  initialTagIds: string[];
  handlePendingTags: (tags: any) => void;
};
const ScreenTwoTagCloud = ({ initialTagIds, handlePendingTags }: Props) => {
  // Must maintain local state for tags and only update the store when the user clicks save.
  const [selectedTags, setSelectedTags] = React.useState<string[] | undefined>(initialTagIds);
  const localMatchedTags = useMatchedTags(selectedTags);

  const toggleTagStateLocal = (tagId: string) => {
    const foundTag = localMatchedTags.find((el) => el.id === tagId);
    if (!foundTag) return;
    if (foundTag.state === 'include') {
      // REMOVE Tag
      setSelectedTags((prev) => {
        const newTags = prev?.filter((el) => el !== tagId);
        handlePendingTags(newTags);
        return newTags;
      });
    } else {
      // ADD Tag
      setSelectedTags((prev) => {
        const newTags = [...(prev || []), tagId];
        handlePendingTags(newTags);
        return newTags;
      });
    }
  };

  return (
    <View>
      <TagCloudEnhanced>
        {localMatchedTags?.map((el) => (
          <TagItem
            size="xs"
            onToggleTag={toggleTagStateLocal}
            state={el.state}
            tagId={el.id}
            tagName={el?.name}
            key={el?.id}
            type="boolean"
          />
        ))}
      </TagCloudEnhanced>
    </View>
  );
};

export default ScreenTwoTagCloud;
