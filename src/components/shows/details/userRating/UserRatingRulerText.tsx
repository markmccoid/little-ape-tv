import React from 'react'; // Import React
import { Text, TextInput } from 'react-native'; // Import the base Text component
import Animated, { useDerivedValue, useAnimatedProps } from 'react-native-reanimated';

// Make the base Text component animatable for the 'text' prop
const AnimatedText = Animated.createAnimatedComponent(TextInput);

const AnimatedScrollValueDisplay = ({ scrollX }) => {
  // 1. Create a derived value that holds the *string* representation
  //    This calculation runs on the UI thread whenever scrollX changes.

  const derivedText = useDerivedValue(() => {
    const roundedValue = Math.round(scrollX.value);
    // Important: Return a string, as the 'text' prop expects a string.
    // console.log('derivedText', roundedValue);
    return String(roundedValue);
  }, [scrollX]); // Dependency array is good practice

  // 2. Create animated props object. This also runs on the UI thread.
  //    It maps the derived value to the 'text' prop of the component.
  const animatedProps = useAnimatedProps(() => {
    // console.log('AnimProp', derivedText.value);
    return {
      text: derivedText.value, // Assign the derived string to the 'text' prop
    };
  });

  // 3. Render the AnimatedText component and pass the animatedProps
  //    Reanimated will efficiently update the 'text' prop on the UI thread.
  // return <Text>{derivedText.value}</Text>;
  return <AnimatedText animatedProps={animatedProps} style={{ fontSize: 24, width: 40 }} />;
};

export default AnimatedScrollValueDisplay;
