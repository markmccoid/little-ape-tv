import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { MotiPressable } from 'moti/interactions';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native'; // Import Dimensions for screen size

const extraMenu: MenuItem[] = [
  { icon: 'award', color: 'turquoise' },
  { icon: 'cast', color: 'salmon' },
];

type Icon = keyof (typeof Feather)['glyphMap'];
type MenuItem = {
  icon: Icon;
  color: string;
};

const _colors = {
  gray: '#1D1520',
  white: '#f3f3f3',
};

// Expanded menu with 10 items
const menu: MenuItem[] = [
  { icon: 'rotate-ccw', color: '#33A5E4' },
  { icon: 'youtube', color: '#F73B30' },
  { icon: 'image', color: '#FE63F4' },
  { icon: 'camera', color: '#4CAF50' },
  { icon: 'message-square', color: '#FF9800' },
  { icon: 'settings', color: '#9C27B0' },
  { icon: 'bell', color: '#E91E63' },
  { icon: 'map-pin', color: '#673AB7' },
  { icon: 'heart', color: '#F44336' },
  { icon: 'trash-2', color: '#607D8B' },
];

////////////////////
///////////// API //
////////////////////

type FabButtonProps = {
  menu: MenuItem[];
  size?: number;
  closedOffset?: number;
  onPress: (selectedItem: MenuItem) => void;
  radiusFactor?: number; // Added prop to control radius
  angleOffsetFactor?: number; //Added prop to control angle
};

export function FabButton({
  menu,
  size = 64,
  closedOffset = 4,
  onPress,
  radiusFactor = 1.8, // Default radius factor
  angleOffsetFactor = 3, //Default angle offset factor.  Smaller values = wider spread
}: FabButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconSize = useMemo(() => size * 0.4, [size]);

  // Adjust offset angle and radius for more items
  const numberOfItems = menu.length;
  const _offsetAngle = Math.PI / angleOffsetFactor; // Use prop
  const _radius = size * radiusFactor; //Use prop

  return (
    <View className="z-20">
      <View style={{ position: 'absolute' }}>
        {menu.map((menuItem, index) => {
          // Take the midPoint of the menu
          // Create a reflected index that will have 0 as midPoint and +-1 on sides.
          // Example:
          // 3 items => [-1, 0, 1]
          // 5 items => [-2, -1, 0, 1, 2]
          const midPoint = Math.floor(menu.length / 2);
          const reflectedIndex = index - midPoint;

          return (
            <MotiPressable
              key={menuItem.icon}
              onPress={() => {
                setIsOpen((isOpen) => !isOpen);
                onPress(menuItem);
              }}
              animate={{
                translateX:
                  Math.sin(reflectedIndex * _offsetAngle) * (isOpen ? _radius : closedOffset),
                translateY:
                  -Math.cos(reflectedIndex * _offsetAngle) * (isOpen ? _radius : closedOffset),
              }}
              style={[
                styles.circle,
                { backgroundColor: menuItem.color, position: 'absolute' },
                { width: size, height: size, borderRadius: size / 2 },
              ]}
              transition={{
                delay: index * 50, // Adjusted delay for smoother animation
              }}>
              <Feather name={menuItem.icon} size={iconSize} color={'#fff'} />
            </MotiPressable>
          );
        })}
      </View>
      <MotiPressable
        onPress={() => {
          setIsOpen((isOpen) => !isOpen);
        }}
        style={[
          styles.circle,
          { backgroundColor: _colors.gray },
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        animate={{
          rotate: isOpen ? '0deg' : '-45deg',
        }}>
        <Feather name="x" size={iconSize} color={'#fff'} />
      </MotiPressable>
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
