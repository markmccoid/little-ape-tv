import Constants from 'expo-constants';
import { MotiText, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  itemSpacing?: number;
  currentRating: number;
};

export function UserRatingDetailScreen({
  menu,
  size = 84,
  closedOffset = 4,
  onPress,
  itemSpacing = 10,
  currentRating = 0,
}: FabButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(currentRating.toString());
  const iconSize = useMemo(() => size * 0.4, [size]);
  const { colors } = useCustomTheme();

  return (
    <View className="z-20">
      <View style={{ position: 'absolute', flexDirection: 'row' }}>
        {menu.map((menuItem, index) => {
          const translateX = isOpen ? (size + itemSpacing) * (index + 1) : 40;
          const translateY = isOpen ? -35 : closedOffset;
          const opacity = isOpen ? 1 : 0;
          const backgroundColor =
            isSelected === menuItem.displayText ? 'yellow' : colors.buttonDarker; //'#ffcc00'; //colors.imdbYellow;
          const scale = isSelected === menuItem.displayText ? 1.2 : 1;

          return (
            <MotiPressable
              key={menuItem.displayText}
              onPress={() => {
                setIsSelected(menuItem.displayText);
                setIsOpen((isOpen) => !isOpen);
                onPress(menuItem);
              }}
              disabled={!isOpen}
              animate={{
                translateX,
                translateY,
                opacity,
                backgroundColor, // Background color animates first with text scale
                scale,
              }}
              style={[
                styles.circle,
                {
                  position: 'absolute',
                  left: -size - itemSpacing + 4,
                },
                {
                  width: size,
                  height: size,
                  borderRadius: 10,
                  borderWidth: isSelected === menuItem.displayText ? 1 : 0,
                  borderColor: isSelected === menuItem.displayText ? colors.imdbYellow : '',
                },
              ]}
              transition={{
                // No delay for backgroundColor, fast transition
                backgroundColor: { type: 'timing', duration: 200 },
                scale: { type: 'timing', duration: 200 },
                // Delay translate and opacity animations
                translateX: { type: 'spring', delay: 150 + index * 50 },
                translateY: { type: 'spring', delay: 150 + index * 50 },
                opacity: { type: 'timing', duration: 300, delay: 150 + index * 50 },
              }}>
              <MotiText
                animate={{ scale }} // Scale happens immediately
                transition={{
                  type: 'timing',
                  duration: 200, // Fast scale animation
                  delay: 0, // No delay, happens before translate
                }}
                className={`text-lg font-bold ${isSelected === menuItem.displayText ? 'text-black' : 'text-white'} `}>
                {/* className={`text-lg font-bold ${isSelected === menuItem.displayText ? 'text-buttondarkertext' : 'text-[#000000]'} `}> */}
                {menuItem.displayText}
              </MotiText>
            </MotiPressable>
          );
        })}
      </View>
      <MotiView
        animate={{
          rotate: isOpen ? '45deg' : '0deg',
          transform: [{ scaleX: isOpen ? 0.8 : 1 }],
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
            { backgroundColor: 'yellow', borderWidth: 1, borderColor: colors.imdbYellow },
            { width: 40, height: size, borderRadius: 10 },
          ]}>
          <MotiText
            animate={{ rotate: isOpen ? '-45deg' : '0deg' }}
            className="font-bold text-black"
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

// import Constants from 'expo-constants';
// import { MotiText, MotiView } from 'moti';
// import { MotiPressable } from 'moti/interactions';
// import { useMemo, useState } from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { useCustomTheme } from '~/utils/customColorTheme';

// export type MenuItem = {
//   displayText: string;
//   color?: string;
// };

// type FabButtonProps = {
//   menu: MenuItem[];
//   size?: number;
//   closedOffset?: number;
//   onPress: (selectedItem: MenuItem) => void;
//   itemSpacing?: number; // Added prop for spacing between items
//   currentRating: number;
// };

// export function UserRatingDetailScreen({
//   menu,
//   size = 64,
//   closedOffset = 4,
//   onPress,
//   itemSpacing = 10, // Default spacing
//   currentRating = 0,
// }: FabButtonProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSelected, setIsSelected] = useState('0');
//   const iconSize = useMemo(() => size * 0.4, [size]);
//   const { colors } = useCustomTheme();

//   return (
//     <View className="z-20">
//       <View style={{ position: 'absolute', flexDirection: 'row' }}>
//         {/* Use row layout */}
//         {menu.map((menuItem, index) => {
//           const translateX = isOpen ? (size + itemSpacing) * (index + 1) : closedOffset;
//           const translateY = isOpen ? -35 : closedOffset;
//           const opacity = isOpen ? 1 : 0;
//           const backgroundColor = isSelected === menuItem.displayText ? 'red' : colors.imdbYellow;
//           const scale = isSelected === menuItem.displayText ? 1.2 : 1;
//           return (
//             <MotiPressable
//               key={menuItem.displayText}
//               onPress={() => {
//                 setIsSelected(menuItem.displayText);
//                 setIsOpen((isOpen) => !isOpen);
//                 onPress(menuItem);
//               }}
//               animate={{
//                 translateX: translateX,
//                 translateY: translateY, //0, // No vertical movement
//                 opacity,
//                 backgroundColor,
//                 scale,
//               }}
//               style={[
//                 styles.circle,
//                 {
//                   // backgroundColor: menuItem.color || colors.imdbYellow,
//                   position: 'absolute',
//                   left: -size - itemSpacing,
//                 }, // Positioning
//                 { width: size, height: size, borderRadius: 10 },
//               ]}
//               transition={{
//                 // No delay for backgroundColor, fast transition
//                 backgroundColor: { type: 'timing', duration: 200 },
//                 // Delay translate and opacity animations
//                 translateX: { type: 'timing', duration: 300, delay: 150 + index * 50 },
//                 translateY: { type: 'timing', duration: 300, delay: 150 + index * 50 },
//                 opacity: { type: 'timing', duration: 300, delay: 150 + index * 50 },
//                 // delay: index * 50,
//               }}>
//               <MotiText
//                 from={{ scale: isSelected === menuItem.displayText ? 1 : 1.2 }}
//                 animate={{ scale: isSelected === menuItem.displayText ? 1.2 : 1 }}
//                 className="text-lg font-bold">
//                 {menuItem.displayText}
//               </MotiText>
//             </MotiPressable>
//           );
//         })}
//       </View>
//       <MotiView
//         animate={{
//           rotate: isOpen ? '45deg' : '0deg',
//           transform: [{ scaleX: isOpen ? 0.8 : 1 }],
//           // scale: isOpen ? 0.5 : 1,
//         }}>
//         <MotiPressable
//           onPress={() => {
//             setIsOpen((isOpen) => !isOpen);
//           }}
//           onLongPress={() => {
//             onPress({ displayText: '0' });
//             if (isOpen) {
//               setIsOpen((isOpen) => !isOpen);
//             }
//           }}
//           style={[
//             styles.circle,
//             { backgroundColor: colors.buttonDarker },
//             { width: 40, height: size, borderRadius: 10 },
//           ]}>
//           {/* <Feather name="x" size={iconSize} color={'#fff'} /> */}
//           <MotiText
//             animate={{ rotate: isOpen ? '-45deg' : '0deg' }}
//             className="font-bold text-buttondarkertext"
//             style={{ fontSize: 20 }}>
//             {currentRating}
//           </MotiText>
//         </MotiPressable>
//       </MotiView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-evenly',
//     paddingTop: Constants.statusBarHeight,
//     paddingBottom: Constants.statusBarHeight,
//     backgroundColor: '#ecf0f1',
//     padding: 8,
//   },
//   fabContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingBottom: 40,
//     marginBottom: 20,
//   },
//   text: {
//     fontFamily: 'AnonymousPro_700Bold',
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     textAlign: 'right',
//   },
//   circle: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
