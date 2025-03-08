import { Alert } from 'react-native';

export const confirmAlert = (title: string, message: string, onYes, onNo) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'No',
        onPress: onNo,
        style: 'cancel', // iOS only: Gives the button a different visual style
      },
      { text: 'Yes', onPress: onYes },
    ],
    { cancelable: false } // Prevents dismissing the alert by tapping outside on Android
  );
};
