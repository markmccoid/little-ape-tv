import { View, Text } from 'react-native';
import React from 'react';
import { use$ } from '@legendapp/state/react';
import { savedShows$, tags$, useShowTags } from '~/store/store-shows';
import TagCloudEnhanced, { TagItem } from '~/components/common/TagCloud/TagCloudEnhanced';

type Props = {
  showId: string;
};
const ScreenTwoTagCloud = ({ showId }: Props) => {
  const { matchedTags, toggleTagState } = useShowTags(showId);

  return (
    <View>
      <TagCloudEnhanced>
        {matchedTags?.map((el) => (
          <TagItem
            size="xs"
            onToggleTag={toggleTagState}
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
