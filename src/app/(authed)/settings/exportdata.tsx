import { View, Text, Pressable, Alert } from 'react-native';
import React from 'react';
import { saveJSONToFiles } from '~/utils/utils';
import { backupFileName, createBackup, restoreBackup } from '~/data/backup';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

const ExportData = () => {
  const handleExport = async () => {
    await saveJSONToFiles(createBackup(), backupFileName());
  };
  //# IMPORT Data (v2 backups only)
  const importJSONFromFiles = async () => {
    try {
      // Prompt the user to pick a JSON file from the Files app
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'application/json', // Restrict to JSON files
        copyToCacheDirectory: true, // Copy the file to the app's cache for reading
      });
      if (pickerResult.canceled) {
        return;
      }
      const fileContent = await new File(pickerResult.assets[0].uri).text();
      const jsonData = JSON.parse(fileContent);

      const confirmed = await new Promise<boolean>((resolve) =>
        Alert.alert(
          'Replace All Data?',
          'Importing replaces all shows, episodes, tags, settings and saved filters with the backup.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Import', style: 'destructive', onPress: () => resolve(true) },
          ]
        )
      );
      if (!confirmed) return;

      const counts = restoreBackup(jsonData);
      Alert.alert(
        'Success',
        `Imported ${counts.shows} shows, ${counts.episodeStates} episodes and ${counts.tags} tags.`
      );
    } catch (error) {
      console.error('Error importing JSON file:', error);
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', `Failed to import JSON file: ${message}`);
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
          <Text className="text-lg font-semibold text-white">Import Data</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ExportData;
