// ThemeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind'; // Import styled if you want to pre-style components

// If you defined ThemeOption in a separate file:
// import { ThemeOption } from './types';
// Otherwise, define it here:
export type ThemeOption = 'auto' | 'light' | 'dark';

const THEME_OPTIONS: ThemeOption[] = ['auto', 'light', 'dark'];

interface ThemeSelectorProps {
  selectedValue: ThemeOption;
  onValueChange: (value: ThemeOption) => void;
}

// Optional: If you want to create pre-styled components with NativeWind
// const StyledView = styled(View);
// const StyledText = styled(Text);
// const StyledTouchableOpacity = styled(TouchableOpacity);

// Helper function to capitalize
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedValue, onValueChange }) => {
  const handlePress = (value: ThemeOption) => {
    if (value !== selectedValue) {
      onValueChange(value);
    }
  };

  return (
    <View className="flex-row py-2">
      {THEME_OPTIONS.map((option) => {
        const isSelected = option === selectedValue;
        return (
          <TouchableOpacity
            key={option}
            className="flex-row items-center px-1 active:opacity-70" // active:opacity-70 for touch feedback
            onPress={() => handlePress(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={capitalize(option)}>
            {/* Radio Button Visual */}
            <View
              className={`
                mr-1 h-4 w-4 items-center justify-center rounded-full border-2
                ${isSelected ? 'border-primary bg-primary' : 'border-gray-400 bg-transparent'}
              `}>
              {isSelected && (
                <View className="h-2 w-2 rounded-full bg-white" /> // Inner dot for selected state (white on blue)
                // Or, if you prefer the inner dot to be the same color as the border when selected:
                // <View className="h-2 w-2.5 rounded-full bg-blue-500" />
              )}
            </View>

            {/* Label */}
            <Text className={`text-sm ${isSelected ? 'font-semibold text-text' : 'text-gray-700'}`}>
              {capitalize(option)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ThemeSelector;
