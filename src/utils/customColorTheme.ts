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
    primarytext: string;
    button: string;
    buttonDarker: string;
    buttontext: string;
    buttonDarkerText: string;
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
    tagInclude: string;
    tagExclude: string;
    tagIncludeText: string;
    tagExcludeText: string;
  };
};

export const CustomLightTheme: CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#193703', // will be text color in React Native headers
    primarytext: '#e3efd9',
    background: '#e3efd9', // Light background (almost off-white)
    card: '#f9f9f5', //'#a8c4a8', //'#7bb55b', //'#6a9c4f', // Card color (same as primary)
    text: '#222222', // Dark text for readability
    button: '#7d9c66',
    buttonDarker: '#59922D',
    buttontext: '#040316',
    buttonDarkerText: '#040316',
    border: '#606B5A', // Light border
    notification: '#d8504b', // Bright color for notifications
    // header: '#f5fcf2', // Light color for header
    deleteRed: '#a61000',
    includeGreen: '#6cb043',
    imdbYellow: '#ECC233',
    tagInclude: '#3E8326',
    tagIncludeText: '#e3efd9',
    tagExclude: '#a61000',
    tagExcludeText: '#e3efd9',
    // // Additional recommended colors
    // secondary: '#2f80ed', // Secondary brand color (contrasting blue)
    // success: '#4caf50', // Success states
    // danger: '#f44336', // Error/destructive actions
    // warning: '#ff9800', // Warning states
    // info: '#2196f3', // Informational states
    // muted: '#757575', // Secondary text/disabled states
    // inputBackground: '#ffffff', // Form input backgrounds
    // inputText: '#1a1a1a', // Form input text
    // inputPlaceholder: '#9e9e9e', // Input placeholder text
    // icon: '#424242', // Default icon color
  },
};

export const CustomDarkTheme: CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#a0c188', // A lighter shade of the base for better visibility on dark background
    primarytext: '#2f3633',
    background: '#1e1e1e', // Dark background
    card: '#415934', //'#4b663c', // Darkened version of base color for cards
    text: '#ffffff', // White text for contrast
    button: '#7d9c66',
    buttonDarker: '#59922D',
    buttontext: '#040316',
    buttonDarkerText: '#040316',
    border: '#99D66F', // Darker border that still provides definition
    notification: '#ff847a', // Brighter red for contrast
    // header: '#191919'
    deleteRed: '#e85a49',
    includeGreen: '#8dc864',
    imdbYellow: '#f8cf4a',
    tagInclude: '#3E8326',
    tagIncludeText: '#e3efd9',
    tagExclude: '#a61000',
    tagExcludeText: '#e3efd9',
  },
};
