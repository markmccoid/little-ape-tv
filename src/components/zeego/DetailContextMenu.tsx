import * as Linking from 'expo-linking';
import * as ContextMenu from 'zeego/context-menu';
import { View, Text } from 'react-native';
import React from 'react';
import { nativeShareItem } from '@/utils/utils';
import { useRouter } from 'expo-router';

type Props = {
  shareLink: string | undefined;
  showId: number | undefined;
  showName: string | undefined;
  existsInSaved: boolean;
  children: React.ReactElement; // A single React element
};

const MDDetailContextMenu = ({ shareLink, showId, showName, existsInSaved, children }: Props) => {
  const router = useRouter();
  // console.log("shareLink", shareLink);
  // console.log("createURL", Linking.createURL(`/search/${showId}`));
  const handleShare = () =>
    nativeShareItem({
      message: `Open and Search in Little Ape TV -> \n${Linking.createURL(`/${showId}`)}`,
      url: shareLink,
    });
  const handlePickImage = () => {
    router.navigate({ pathname: `/[showId]/detailimagemodal`, params: { showId: showId } });
  };
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item key="share" onSelect={handleShare}>
          <ContextMenu.ItemTitle>{`Share ${showName}`}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'square.and.arrow.up',
              pointSize: 18,
              weight: 'semibold',
              scale: 'medium',
            }}></ContextMenu.ItemIcon>
        </ContextMenu.Item>
        {existsInSaved && (
          <ContextMenu.Item key="changeimage" onSelect={handlePickImage}>
            <ContextMenu.ItemTitle>{`Pick Image`}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon
              ios={{
                name: 'photo',
                pointSize: 18,
                weight: 'semibold',
                scale: 'medium',
              }}></ContextMenu.ItemIcon>
          </ContextMenu.Item>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

export default MDDetailContextMenu;
