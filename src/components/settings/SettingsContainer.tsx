import { View, Text, Pressable, ScrollView, Switch, SafeAreaView, Alert } from 'react-native';
import React from 'react';
import { Link, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import SettingsGroup from './SettingsGroup';
import { FilterIcon, FlagIcon } from '../common/Icons';
import { ThemeOption } from './ThemeSelector';
import {
  checkForProviderUpdates,
  checkForShowUpdatesAndNotify,
  clearStreamUpdatedEpoch,
  getBGTaskStatus,
  registerBackgroundTask,
  removeBackgroundTask,
} from '~/utils/backgroundTasks';
import { savedShows$ } from '~/store/store-shows';
import * as BackgroundTask from 'expo-background-task';

const SettingsContainer = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();
  const showImages = use$(settings$.showImageInEpisode);
  const showNextDownloadEpisode = use$(settings$.downloadOptions.showNextDownloadInfo);
  const excludeGenresFromPerson = use$(settings$.excludeGenresFromPerson);
  const defaultTheme = use$(settings$.defaultTheme);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="pt-2">
        <SettingsGroup title="Manage Tags & Filters">
          <SettingsGroup.RouteItem
            title="Saved Filters"
            route="/(authed)/settings/savedfiltersmaint"
            LeftSymbol={() => <FilterIcon color={colors.buttonDarker} size={23} />}
          />
          <SettingsGroup.RouteItem
            title="Tag Maintenance"
            route="/(authed)/settings/tagsetup"
            LeftSymbol={() => <SymbolView name="tag" tintColor={colors.buttonDarker} size={28} />}
          />
          <SettingsGroup.RouteItem
            title="Watch Provider Maintenance"
            route="/(authed)/settings/watchprovidersetup"
            LeftSymbol={() => (
              <SymbolView name="tv.badge.wifi" tintColor={colors.buttonDarker} size={28} />
            )}
          />
          {/* <SettingsGroup.SwitchItem /> */}
        </SettingsGroup>

        {/* Set Default Appearance */}
        <SettingsGroup style={{ marginTop: 8 }} title="Customize">
          <SettingsGroup.RouteItem
            title="Initial Query"
            route="/(authed)/settings/initialQueryRoute"
            LeftSymbol={() => (
              <SymbolView
                name="waveform.badge.magnifyingglass"
                tintColor={colors.buttonDarker}
                size={28}
              />
            )}
          />
          <SettingsGroup.ThemeSelect
            title="Default Appearance"
            selectCallback={(theme?: ThemeOption) => settings$.defaultTheme.set(theme || 'auto')}
            selectValue={defaultTheme}
            LeftSymbol={() =>
              defaultTheme === 'auto' ? (
                <SymbolView name="light.recessed" tintColor={colors.buttonDarker} size={28} />
              ) : defaultTheme === 'light' ? (
                <SymbolView name="light.max" tintColor={colors.buttonDarker} size={28} />
              ) : (
                <SymbolView name="light.min" tintColor={colors.buttonDarker} size={28} />
              )
            }
          />
        </SettingsGroup>
        {/* Show Images on Episode List */}
        <SettingsGroup style={{ marginTop: 8 }}>
          <SettingsGroup.SwitchItem
            title="Show Images on Episode List"
            switchCallback={() => settings$.showImageInEpisode.set((prev) => !prev)}
            switchValue={showImages}
            LeftSymbol={() =>
              showImages ? (
                <SymbolView
                  name="photo.badge.checkmark"
                  tintColor={colors.buttonDarker}
                  size={28}
                />
              ) : (
                <SymbolView name="photo" tintColor={colors.buttonDarker} size={28} />
              )
            }
          />
        </SettingsGroup>
        {/* Show Next Download Episode */}
        <SettingsGroup style={{ marginTop: 8 }}>
          <SettingsGroup.SwitchItem
            title="Show Next Download Episode"
            switchCallback={() =>
              settings$.downloadOptions.showNextDownloadInfo.set((prev) => !prev)
            }
            switchValue={showNextDownloadEpisode}
            LeftSymbol={() => (
              <SymbolView name="arrow.down.square" tintColor={colors.buttonDarker} size={28} />
            )}
          />
        </SettingsGroup>

        {/* Exclude Talk shows from Person Show List */}
        <SettingsGroup style={{ marginTop: 8 }}>
          <SettingsGroup.SwitchItem
            title="Exclude Talk Shows/Person List"
            switchCallback={(val) => {
              const newVal = val ? ['talk'] : [];
              settings$.excludeGenresFromPerson.set(newVal);
            }}
            switchValue={excludeGenresFromPerson?.length > 0}
            LeftSymbol={() =>
              excludeGenresFromPerson?.length > 0 ? (
                <SymbolView name="person.slash" tintColor={colors.buttonDarker} size={28} />
              ) : (
                <SymbolView name="person" tintColor={colors.buttonDarker} size={28} />
              )
            }
          />
        </SettingsGroup>

        {/* Max User Rating Number */}
        <SettingsGroup style={{ marginTop: 8 }}>
          <SettingsGroup.NumberItem
            title="Max User Ratings"
            selectCallback={(val: number) => {
              settings$.userRatingMax.set(val);
            }}
            selectValue={settings$.userRatingMax.peek()}
            LeftSymbol={() => (
              <SymbolView name="number" tintColor={colors.buttonDarker} size={28} />
            )}
          />
        </SettingsGroup>

        {/* Scheduled Notifications */}
        <View className="mt-2" />
        <SettingsGroup title="Other">
          <SettingsGroup.RouteItem
            title="Export/Import Data"
            route="/(authed)/settings/exportdata"
            LeftSymbol={() => <FlagIcon color={colors.buttonDarker} size={23} />}
          />
          <SettingsGroup.RouteItem
            title="Scheduled Notifications"
            route="/(authed)/settings/schedulednotifications"
            LeftSymbol={() => <FilterIcon color={colors.buttonDarker} size={23} />}
          />
        </SettingsGroup>
        <View className="flex-col items-center justify-center gap-2 px-2 py-2">
          <View className="mx-2 w-full flex-row justify-between">
            <View className="flex-col gap-2">
              <Pressable onPress={checkForShowUpdatesAndNotify} className="border bg-white p-2">
                <Text>Manual Check Show</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const shows = savedShows$.shows.peek();
                  Object.keys(shows).forEach((key) => {
                    savedShows$.shows[key]?.lastNotifySeasonEpisode.set(undefined);
                    savedShows$.shows[key]?.dateLastNotifyCheckedEpoch.set(undefined);
                    savedShows$.shows[key]?.nextNotifyOffset.set(undefined);
                    settings$.backgroundRunLog.set([]);
                  });
                  Alert.alert(
                    `DONE Reset -> lastNotifySeasonEpisode\ndateLastNotifyCheckedEpoch\nnextNotifyOffset `
                  );
                }}
                className="border bg-white p-2">
                <Text>Reset NextNotifyDates</Text>
              </Pressable>
            </View>
            <View className="flex-col gap-2">
              <Pressable onPress={checkForProviderUpdates} className="border bg-yellow-400 p-2">
                <Text>Manual Check Providers</Text>
              </Pressable>
              <Pressable onPress={clearStreamUpdatedEpoch} className="border bg-yellow-400 p-2">
                <Text>Clear Stream Dates</Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-col gap-2">
            <Pressable
              onPress={() => {
                settings$.notificationHistory.set({});
                settings$.backgroundRunLog.set([]);
              }}
              className="border bg-blue-300 p-2">
              <Text>Clear Notification History</Text>
            </Pressable>
            {/* <Pressable
              onPress={async () => await removeBackgroundTask('check-new-episodes')}
              className="border bg-blue-300 p-2">
              <Text>Remove Task 'check-new-episodes'</Text>
            </Pressable>
            <Pressable
              onPress={async () => await registerBackgroundTask()}
              className="border bg-blue-300 p-2">
              <Text>Register Background Tasks</Text>
            </Pressable>
            <Pressable
              onPress={async () => await getBGTaskStatus()}
              className="border bg-blue-300 p-2">
              <Text>Background Task Status</Text>
            </Pressable> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsContainer;
