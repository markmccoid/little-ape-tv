import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forwardRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { FilterIcon } from './common/Icons';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    return (
      <Pressable onPress={onPress} className="mr-[5]">
        {({ pressed }) => (
          <FilterIcon size={25} color="red" style={{ opacity: pressed ? 0.5 : 1 }} />
        )}
      </Pressable>
    );
  }
);

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
});
