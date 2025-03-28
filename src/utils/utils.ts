import { Share } from 'react-native';

//~  --------------------------------------
//~  format Epoch number to not include any time information
//~  You can send either milliseconds or seconds, but you
//~  will always get back seconds
//~  --------------------------------------
export const formatEpoch = (epoch: number) => {
  if (!epoch) return 0;
  if (epoch < 1e12) {
    epoch = epoch * 1000;
  }
  const newDate = new Date(epoch);
  newDate.setHours(0, 0, 0, 0);
  return Math.floor(newDate.getTime() / 1000);
};

export const nativeShareItem = async ({ message, url }: { message: string; url: string }) => {
  try {
    const result = await Share.share({
      message,
      url,
    });
    //-------
    //- Below code can be used if you want to have some sort of
    //- callback after you have shared or dismissed the share ui
    // if (result.action === Share.sharedAction) {
    //   if (result.activityType) {
    //     // shared with activity type of result.activityType
    //     console.log("result.activitytype", result.activityType);
    //   } else {
    //     console.log("just shared", result);
    //     // shared
    //   }
    // } else if (result.action === Share.dismissedAction) {
    //   // dismissed
    // }
  } catch (error) {
    alert(error);
  }
};

//~  --------------------------------------
//~  Merge two arrays of objects with a priority
//~  The second array will overwrite the first array
//~  if the id is the same in both arrays
//~  the "id" property is required in the objects in the arrays
//~  --------------------------------------
// My example case is for the Sort.  If we add new sort fields, we need those to show up so we merge the "default sorts", which would contain the new sort fields.
export const priorityMergeArrays = <T extends { id: string }>(arr1: T[], arr2: T[]): T[] => {
  // Create a set of existing IDs from arr1
  const existingIds = new Set(arr1.map((item) => item.id));

  // Filter arr2 to only include items not in arr1
  const uniqueNewItems = arr2.filter((item) => !existingIds.has(item.id));

  // Return the original arr1 with unique new items added
  return [...arr1, ...uniqueNewItems];
};
