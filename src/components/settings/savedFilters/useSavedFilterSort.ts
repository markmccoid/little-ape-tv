import React, { useCallback, useState } from 'react';
import { SortItemProps } from '~/components/sortmanager/SortItem';
import { defaultSort, reorderSorts, SortField } from '~/store/store-filterCriteria';

export const useSavedFilterSort = (initSort: SortField[] | undefined) => {
  const [workingSortFields, setWorkingSortFields] = useState<SortField[]>(initSort || defaultSort);

  const updateActiveFlag: SortItemProps['updateActiveFlag'] = (item, newValue) => {
    updateSortSettings({ ...item, active: newValue });
  };
  const updateSortDirection: SortItemProps['updateSortDirection'] = (item, prevValue) => {
    const newSortDirection = prevValue === 'asc' ? 'desc' : 'asc';
    updateSortSettings({ ...item, sortDirection: newSortDirection });
  };

  const savedSortReorder = (sortedIds: string[]) => {
    setWorkingSortFields(reorderSorts(sortedIds, workingSortFields));
  };
  const updateSortSettings = useCallback(
    (newSortFieldValues: SortField) => {
      setWorkingSortFields((prev) => {
        const newSortSettings = prev.map((sort) => {
          if (sort.id === newSortFieldValues.id) {
            return newSortFieldValues;
          } else {
            return sort;
          }
        });

        return reorderSorts(
          newSortSettings.map((el) => el.id),
          newSortSettings
        );
      });
    },
    [workingSortFields]
  );

  return { workingSortFields, savedSortReorder, updateActiveFlag, updateSortDirection };
};
