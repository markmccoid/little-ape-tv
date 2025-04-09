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
        <SettingsGroup title="Manage Tags and Filters">
          {/* SAVED Filters */}
          <SettingsItem
            title="Saved Filters"
            settingType="route"
            route="/(authed)/settings/savedfiltersmaint"
            // childStyle={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
            isFirst={true}
            LeftSymbol={() => <FilterIcon color={colors.buttonDarker} size={23} />}
          />
          {/* Tag Maintenance */}
          <SettingsItem
            title="Tag Maintenance"
            settingType="route"
            route="/(authed)/settings/tagsetup"
            isLast={true}
            // childStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            LeftSymbol={() => <SymbolView name="tag" tintColor={colors.buttonDarker} size={28} />}
          />
        </SettingsGroup>

        {/* Show Images on Episode List */}
        <SettingsItem
          title="Show Images on Episode List"
          settingType="switch"
          switchCallback={() => settings$.showImageInEpisode.set((prev) => !prev)}
          switchValue={showImages}
        />
        {/* Show Next Download Episode */}
        <SettingsItem
          title="Show Next Download Episode"
          settingType="switch"
          switchCallback={() => settings$.downloadOptions.showNextDownloadInfo.set((prev) => !prev)}
          switchValue={showNextDownloadEpisode}
        />

        {/* Exclude Talk shows from Person Show List */}
        <SettingsItem
          title="Exclude Talk Shows/Person List"
          settingType="switch"
          switchCallback={(val) => {
            const newVal = val ? ['talk'] : [];
            settings$.excludeGenresFromPerson.set(newVal);
          }}
          switchValue={excludeGenresFromPerson?.length > 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsContainer;
