import { View, StyleSheet } from 'react-native';
import React from 'react';

const MDBackground = ({ opacity = 0.5 }: { opacity?: number }) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        opacity: opacity,
        borderRadius: 10,
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        ...StyleSheet.absoluteFillObject,
        position: 'absolute',
      }}
    />
  );
};

export default MDBackground;
