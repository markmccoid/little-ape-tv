import { DefaultTheme, DarkTheme, Theme, useTheme } from '@react-navigation/native';

//! Custom Hook for typesafe colors
//~ Usage - const {colors} = useCustomTheme();
export function useCustomTheme() {
  return useTheme() as CustomTheme;
}

// Add additional colors outside of react navigation themes
type CustomTheme = Theme & {
  colors: Theme['colors'] & {
    // primaryForeground: string;
    // secondary: string;
    // secondaryForeground: string;
    // muted: string;
    // mutedForeground: string;
    // button: string;
    // buttontext: string;
    // textInverted: string;
    // textInput: string;
    // cardInverted: string;
    // cardForeground: string;
    // colorSelected: string;
    // destructive: string;
    // destructiveForeground: string;
    deleteRed: string;
    includeGreen: string;
    imdbYellow: string;
  };
};

export const CustomLightTheme: CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#222222', // Base card color
    background: '#f0f5ec', // Light background (almost off-white)
    card: '#6a9c4f', // Card color (same as primary)
    text: '#222222', // Dark text for readability
    border: '#b3c7a8', // Light border
    notification: '#d8504b', // Bright color for notifications
    // header: '#f5fcf2', // Light color for header
    deleteRed: '#a61000',
    includeGreen: '#6cb043',
    imdbYellow: '#ECC233',
  },
};

export const CustomDarkTheme: CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#a0c188', // A lighter shade of the base for better visibility on dark background
    background: '#1e1e1e', // Dark background
    card: '#4b663c', // Darkened version of base color for cards
    text: '#ffffff', // White text for contrast
    border: '#3d5435', // Darker border that still provides definition
    notification: '#ff847a', // Brighter red for contrast
    // header: '#191919'
    deleteRed: '#e85a49',
    includeGreen: '#8dc864',
    imdbYellow: '#f8cf4a',
  },
};
