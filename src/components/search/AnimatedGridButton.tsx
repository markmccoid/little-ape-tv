import { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { SymbolView } from 'expo-symbols'; // Adjust this import based on your project
import { useCustomTheme } from '~/utils/customColorTheme';
import { settings$ } from '~/store/store-settings';

const AnimatedGridButton = () => {
  const { colors } = useCustomTheme();
  // Track the current state locally to handle animation
  const [usingThreeColumns, setUsingThreeColumns] = useState(
    settings$.searchNumColumns.peek() === 3
  );

  // Keep local state in sync with global state
  useEffect(() => {
    const disposeListener = settings$.searchNumColumns.onChange((value) => {
      setUsingThreeColumns(value.value === 3);
    });

    return () => disposeListener();
  }, []);

  const toggleColumns = () => {
    settings$.searchNumColumns.set((prev) => (prev === 2 ? 3 : 2));
  };

  return (
    <Pressable onPress={toggleColumns} className="mx-1 items-center justify-center rounded-lg p-1">
      <MotiView
        animate={{
          opacity: usingThreeColumns ? 1 : 0,
          scale: usingThreeColumns ? 1 : 0.1,
        }}
        transition={{
          type: 'timing',
          duration: 600,
        }}
        style={{ position: 'absolute' }}>
        <SymbolView name="square.grid.2x2.fill" tintColor={colors.buttontext} size={25} />
      </MotiView>

      <MotiView
        animate={{
          opacity: usingThreeColumns ? 0 : 1,
          scale: usingThreeColumns ? 0.1 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 600,
        }}>
        <SymbolView name="square.grid.3x3.fill" tintColor={colors.buttontext} size={25} />
      </MotiView>
    </Pressable>
  );
};

export default AnimatedGridButton;
