import { Share } from 'react-native';

//# --------------------------------------
//# Default Images
//# --------------------------------------
export function getRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 12) + 1; // Generate random number between 1 and 13
  return randomNumber.toString().padStart(2, '0'); // Pad number with leading zero if less than 10
}

const hashStringToNumber = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

export const noImageFound = {
  noimagefound: require('../../assets/images/noimagefound.jpeg'),
};
export const defaultVideosThumbs = {
  image_01: require('../../assets/images/defaultimages/video_comedy.jpeg'),
  image_02: require('../../assets/images/defaultimages/video_documentary.jpeg'),
  image_03: require('../../assets/images/defaultimages/video_drama.jpeg'),
  image_04: require('../../assets/images/defaultimages/video_horror.jpeg'),
  image_05: require('../../assets/images/defaultimages/video_romantic.jpeg'),
  image_06: require('../../assets/images/defaultimages/video_sciencefiction.jpeg'),
  image_07: require('../../assets/images/defaultimages/video_thriller.jpeg'),
  // comedy: require('../../assets/images/defaultimages/video_comedy.jpeg'),
  // documentary: require('../../assets/images/defaultimages/video_documentary.jpeg'),
  // drama: require('../../assets/images/defaultimages/video_drama.jpeg'),
  // horror: require('../../assets/images/defaultimages/video_horror.jpeg'),
  // romantic: require('../../assets/images/defaultimages/video_romantic.jpeg'),
  // sciencefiction: require('../../assets/images/defaultimages/video_sciencefiction.jpeg'),
  // thriller: require('../../assets/images/defaultimages/video_thriller.jpeg'),
};
export const getDefaultVideoImage = (filename: string) => {
  const hash = hashStringToNumber(filename);
  const num = (hash % Object.keys(defaultVideosThumbs).length) + 1;
  return defaultVideosThumbs[`image${num.toString().padStart(2, '0')}`];
};
export const getNoImageFound = () => {
  return noImageFound[`noimagefound`];
};

//~  --------------------------------------
//~  Return the Unix timestamp in seconds
//~  This is the number of seconds since January 1, 1970
//~  --------------------------------------
export const getEpochwithTime = () => {
  return Math.floor(Date.now() / 1000);
};

//~  --------------------------------------
//~  Add days to the passed Unix timestamp in seconds
//~  --------------------------------------
export const addDaysToEpoch = (epoch: number, days: number) => {
  if (!epoch) return 0;
  return epoch + days * 24 * 60 * 60;
};
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

//# --------------------------------------
//# Native Share Item
//# --------------------------------------
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
//~  Set the BG color based on the length of the shows runtime
//~  --------------------------------------
const rtColors = {
  15: ['red', 'white'],
  30: ['green', 'white'],
  45: ['yellow', 'black'],
  60: ['orange', 'black'],
};
const rtColorArray = [15, 30, 45, 60];
export const getBGColor = (runTime: number | undefined) => {
  // Find the next greater key
  if (!runTime) return undefined;

  for (const key of rtColorArray) {
    if (key >= runTime) {
      return rtColors[key];
    }
  }
  return ['white', 'black']; // Default color if no match found
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
