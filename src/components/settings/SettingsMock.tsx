import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  StatusBar, // Import StatusBar
} from 'react-native';
// Optional: For better icons, install react-native-vector-icons
// import Icon from 'react-native-vector-icons/Ionicons'; // Example using Ionicons

// Reusable Settings Row Component
const SettingsRow = ({
  icon,
  iconBgColor,
  text,
  isFirst = false,
  isLast = false,
  hasChevron = false,
  hasToggle = false,
  onToggle, // Pass toggle handler
  toggleValue, // Pass toggle state
}) => {
  // Determine border radius classes based on position
  const borderTopRadius = isFirst ? 'rounded-t-lg' : '';
  const borderBottomRadius = isLast ? 'rounded-b-lg' : '';
  const noBottomBorder = isLast ? 'border-b-0' : 'border-b border-gray-200'; // Remove border for last item

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between bg-white p-3 ${borderTopRadius} ${borderBottomRadius} ${noBottomBorder}`}
      activeOpacity={0.7}
      disabled={hasToggle} // Disable touch opacity if it's just a toggle row
    >
      <View className="flex-row items-center space-x-3">
        {/* Icon Background and Icon */}
        <View className={`h-7 w-7 items-center justify-center rounded-md ${iconBgColor}`}>
          {/* Render your icon here - using Text as placeholder */}
          {/* For real icons: <Icon name={iconName} size={18} color="white" /> */}
          <Text className="text-sm font-bold text-white">{icon}</Text>
        </View>
        {/* Text Label */}
        <Text className="text-base">{text}</Text>
      </View>

      {/* Right Element (Toggle or Chevron) */}
      <View>
        {hasToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#E9E9EA', true: '#34C759' }} // iOS style track colors
            thumbColor={'#ffffff'}
            ios_backgroundColor="#E9E9EA" // iOS specific background for off state
          />
        )}
        {hasChevron && (
          // Using Text for chevron, replace with Icon if preferred
          <Text className="text-lg text-gray-400">{'>'}</Text>
          // Example with Icon: <Icon name="chevron-forward-outline" size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Main Screen Component
const SettingsScreen = () => {
  const [isAirplaneModeOn, setIsAirplaneModeOn] = useState(true); // State for the toggle

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Use light-content for status bar text like in iOS dark mode, or default for light */}
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <Text className="mb-4 px-1 text-3xl font-bold">Settings</Text>

          {/* Account Section */}
          <TouchableOpacity
            className="mb-6 flex-row items-center justify-between rounded-lg bg-white p-3"
            activeOpacity={0.7}>
            <View className="flex-row items-center space-x-4">
              {/* Icon Placeholder */}
              <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                <Text className="text-lg font-bold text-gray-700">fpt.</Text>
              </View>
              {/* Text */}
              <View>
                <Text className="text-lg font-semibold">Front Page Tech</Text>
                <Text className="mt-1 text-xs text-gray-500">Apple Account, iCloud+, and more</Text>
              </View>
            </View>
            {/* Chevron */}
            <Text className="text-lg text-gray-400">{'>'}</Text>
            {/* <Icon name="chevron-forward-outline" size={20} color="#C7C7CC" /> */}
          </TouchableOpacity>

          {/* Settings Group 1 */}
          <View className="mb-6">
            <SettingsRow
              icon="✈️" // Example using Emoji
              iconBgColor="bg-orange-500"
              text="Airplane Mode"
              isFirst={true}
              hasToggle={true}
              toggleValue={isAirplaneModeOn}
              onToggle={setIsAirplaneModeOn}
            />
            <SettingsRow
              icon="📶" // Wifi Emoji
              iconBgColor="bg-blue-500"
              text="Wi-Fi"
              hasChevron={true}
            />
            <SettingsRow
              icon="󰂯" // Bluetooth symbol (might need specific font) or use 'B'
              iconBgColor="bg-blue-600" // Slightly different blue
              text="Bluetooth"
              hasChevron={true}
            />
            <SettingsRow
              icon="📊" // Cellular bars emoji
              iconBgColor="bg-green-500"
              text="Cellular"
              hasChevron={true}
            />
            <SettingsRow
              icon="🔋" // Battery Emoji
              iconBgColor="bg-green-600" // Slightly different green
              text="Battery"
              isLast={true}
              hasChevron={true}
            />
          </View>

          {/* Settings Group 2 */}
          <View className="mb-6">
            <SettingsRow
              icon="⚙️" // Gear Emoji
              iconBgColor="bg-gray-500"
              text="General"
              isFirst={true}
              hasChevron={true}
            />
            <SettingsRow
              icon="♿" // Accessibility Emoji
              iconBgColor="bg-blue-500"
              text="Accessibility"
              hasChevron={true}
            />
            <SettingsRow
              icon="🔘" // Action Button Placeholder
              iconBgColor="bg-indigo-500" // Or another color
              text="Action Button"
              hasChevron={true}
            />
            <SettingsRow
              icon="✨" // Apple Intelligence Placeholder
              iconBgColor="bg-purple-500"
              text="Apple Intelligence"
              hasChevron={true}
            />
            <SettingsRow
              icon="📷" // Camera Emoji
              iconBgColor="bg-gray-600" // Darker gray
              text="Camera"
              isLast={true}
              hasChevron={true}
            />
          </View>

          {/* Add More Groups as needed */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
