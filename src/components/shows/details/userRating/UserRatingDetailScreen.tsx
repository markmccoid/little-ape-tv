import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { MotiText, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCustomTheme } from '~/utils/customColorTheme';

export type MenuItem = {
  displayText: string;
  color?: string;
};

type FabButtonProps = {
  menu: MenuItem[];
  size?: number;
  closedOffset?: number;
  onPress: (selectedItem: MenuItem) => void;
  itemSpacing?: number; // Added prop for spacing between items
  currentRating: number;
};

export function UserRatingDetailScreen({
  menu,
  size = 64,
  closedOffset = 4,
  onPress,
  itemSpacing = 10, // Default spacing
  currentRating = 0,
}: FabButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconSize = useMemo(() => size * 0.4, [size]);
  const { colors } = useCustomTheme();

  return (
    <View className="z-20">
      <View style={{ position: 'absolute', flexDirection: 'row' }}>
        {/* Use row layout */}
        {menu.map((menuItem, index) => {
          const translateX = isOpen ? (size + itemSpacing) * (index + 1) : closedOffset;
          const translateY = isOpen ? -35 : closedOffset;
          const opacity = isOpen ? 1 : 0;
          return (
            <MotiPressable
              key={menuItem.displayText}
              onPress={() => {
                setIsOpen((isOpen) => !isOpen);
                onPress(menuItem);
              }}
              animate={{
                translateX: translateX,
                translateY: translateY, //0, // No vertical movement
                opacity,
              }}
              style={[
                styles.circle,
                {
                  backgroundColor: menuItem.color || colors.button,
                  position: 'absolute',
                  left: -size - itemSpacing,
                }, // Positioning
                { width: size, height: size, borderRadius: 10 },
              ]}
              transition={{
                delay: index * 50,
              }}>
              <Text className="text-lg font-bold">{menuItem.displayText}</Text>
            </MotiPressable>
          );
        })}
      </View>
      <MotiView
        animate={{
          rotate: isOpen ? '45deg' : '0deg',
          transform: [{ scaleX: isOpen ? 0.8 : 1 }],
          // scale: isOpen ? 0.5 : 1,
        }}>
        <MotiPressable
          onPress={() => {
            setIsOpen((isOpen) => !isOpen);
          }}
          onLongPress={() => {
            onPress({ displayText: '0' });
            if (isOpen) {
              setIsOpen((isOpen) => !isOpen);
            }
          }}
          style={[
            styles.circle,
            { backgroundColor: colors.buttonDarker },
            { width: 40, height: size, borderRadius: 10 },
          ]}>
          {/* <Feather name="x" size={iconSize} color={'#fff'} /> */}
          <MotiText
            animate={{ rotate: isOpen ? '-45deg' : '0deg' }}
            className="font-bold text-buttondarkertext"
            style={{ fontSize: 20 }}>
            {currentRating}
          </MotiText>
        </MotiPressable>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: Constants.statusBarHeight,
    paddingBottom: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    marginBottom: 20,
  },
  text: {
    fontFamily: 'AnonymousPro_700Bold',
    position: 'absolute',
    bottom: 10,
    right: 10,
    textAlign: 'right',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
