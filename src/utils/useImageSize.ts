import { Dimensions } from 'react-native';
//~~ ------------------------------------------------------
//~~ FOR Main view and Search View
//~~ ------------------------------------------------------
/**
 * Calculates image sizes based on layout and spacing.
 *
 * @param {2 | 3} layout - The layout type (2 or 3).
 * @param {number} containerPadding - The left or right margin (this number will be doubled).
 * @param {number} gap - The space between the images.
 * @returns {{ imageWidth: number, imageHeight: number }} - The calculated image dimensions.
 */
function getImageSizes(layout: 2 | 3 = 2, containerPadding: number = 10, gap: number = 10) {
  // const IMG_WIDTH = (width - 30) / 2;
  // const IMG_HEIGHT = IMG_WIDTH * 1.5;

  const { width: screenWidth } = Dimensions.get('window');
  let imageWidth = 0;
  const CONTAINER_PADDING = containerPadding;
  const GAP = gap; // Desired gap between images
  const availableWidth = screenWidth - 2 * CONTAINER_PADDING;

  if (layout === 2) {
    imageWidth = (availableWidth - GAP) / 2;
  }
  if (layout === 3) {
    // Calculate the width of each image
    imageWidth = (availableWidth - 5 - GAP) / 3;
  }
  const imageHeight = imageWidth * 1.5;

  return { imageWidth, imageHeight, containerPadding, gap };
}

// React hook function
function useImageSize(layout: 2 | 3 = 2, containerPadding: number = 10, gap: number = 10) {
  return getImageSizes(layout, containerPadding, gap); // Inside React components
}

// Attach static method to the hook for external usage
useImageSize.getSizes = getImageSizes;

export default useImageSize;
