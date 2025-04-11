import { View, Text, Pressable, ScrollView, Switch, SafeAreaView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
// import { List, FormItem, Section, Link } from '~/components/expo-router-forms/ui/Form';
import * as Form from '~/components/expo-router-forms/ui/Form';
import { IconSymbol } from '../expo-router-forms/ui/IconSymbol.ios';
import * as AC from '@bacons/apple-colors';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { settings$ } from '~/store/store-settings';
import { use$ } from '@legendapp/state/react';
import SettingsItem from './SettingsItem';
import SettingsGroup from './SettingsGroup';
import { FilterIcon } from '../common/Icons';

const SettingsContainer = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();
  const showImages = use$(settings$.showImageInEpisode);
  const showNextDownloadEpisode = use$(settings$.downloadOptions.showNextDownloadInfo);
  const excludeGenresFromPerson = use$(settings$.excludeGenresFromPerson);

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
          {/* <SettingsGroup.SwitchItem /> */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsContainer;
