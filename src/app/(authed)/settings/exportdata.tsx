import { View, Text, Pressable, Alert } from 'react-native';
import React from 'react';
import { saveJSONToFiles } from '~/utils/utils';
import { exportFilterCriteria, importFilterCriteria } from '~/store/store-filterCriteria';
import { exportShowData, importShowData } from '~/store/store-shows';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const ExportData = () => {
  const handleExport = async () => {
    const filterCriteriaData = exportFilterCriteria();
    const showData = exportShowData();
    const dataToExport = {
      filterCriteria: filterCriteriaData,
      ...showData,
    };
    // Call the function to save JSON data to files
    await saveJSONToFiles(dataToExport);
  };
  //# IMPORT Data
  const importJSONFromFiles = async () => {
    try {
      // Prompt the user to pick a JSON file from the Files app
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'application/json', // Restrict to JSON files
        copyToCacheDirectory: true, // Copy the file to the app's cache for reading
      });

      // Check if the user selected a file or cancelled
      if (pickerResult.canceled) {
        return;
      }

      const { assets } = pickerResult;
      const uri = assets[0].uri;

      // Read the file contents as a string
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse the JSON content into a JavaScript object
      const jsonData = JSON.parse(fileContent);

      // Log the parsed data (replace with your own logic)

      const filterCriteria = jsonData?.filterCriteria;
      const shows = jsonData?.shows;
      const showAttributes = jsonData?.showAttributes;
      const tags = jsonData?.tags;
      if (shows || showAttributes || tags) {
        importShowData({ shows, showAttributes, tags });
      }

      if (filterCriteria) {
        importFilterCriteria(filterCriteria);
      }
      // Display a success message
      Alert.alert('Success', 'JSON file imported successfully!');

      // Example: Use the jsonData in your app (e.g., update state, store in database, etc.)
      // setData(jsonData); // Example for state management
    } catch (error) {
      console.error('Error importing JSON file:', error);
      Alert.alert('Error', `Failed to import JSON file: ${error.message}`);
    }
  };
  return (
    <View className="flex-1  gap-2 p-4">
      <View className="mx-2 mb-1 rounded-lg border-hairline px-2 py-1 ">
        <Text className="text-2xl font-bold text-primary">Export Data</Text>
        <Text className="text-lg text-primary">
          Export your data to a JSON file for backup or sharing. Currently to be able to import
          data, you must save to Files.
        </Text>
        <Pressable
          onPress={handleExport}
          className="rounded-md bg-blue-500 p-4"
          android_ripple={{ color: '#fff' }}>
          <Text className="text-lg font-semibold text-white">Export Data</Text>
        </Pressable>
      </View>
      <View className="mx-2 mb-1 rounded-lg border-hairline px-2 py-1 ">
        <Text className="text-2xl font-bold text-primary">Import Data</Text>
        <Text className="text-lg text-primary">
          You will be prompted to select a JSON file from your device. The app will read the file
          and import the data into the app.
        </Text>
        <Pressable
          onPress={importJSONFromFiles}
          className="rounded-md bg-green-500 p-4"
          android_ripple={{ color: '#fff' }}>
          <Text className="text-lg font-semibold text-white">Imort Data</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ExportData;
