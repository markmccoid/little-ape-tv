import React from 'react';
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  Entypo,
  FontAwesome6,
} from '@expo/vector-icons';
import { TextStyle, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  color?: string;
  style?: TextStyle;
};

export const TagPlusIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="tag-plus" color={color} size={size} style={style} />;
};

export const ViewMovieIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <MaterialIcons name="movie" size={size} color={color} style={style} />;
};
export const ViewTVShowIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <Feather name="tv" size={size} color={color} style={style} />;
};
export const EyeEmptyIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <AntDesign name="eye" size={size} color={color} style={style} />;
};
export const EyeFilledIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <AntDesign name="eye" size={size} color={color} style={style} />;
};
export const EyeWatchedIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <MaterialCommunityIcons name="eye-check" size={size} color={color} style={style} />;
};
export const EyeNotWatchedIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <MaterialCommunityIcons name="eye-off" size={size} color={color} style={style} />;
};
export const TelevisionOffIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <MaterialCommunityIcons name="television-off" size={size} color={color} style={style} />;
};
export const TelevisionIcon = ({ size, color = undefined, style = {} }: Props) => {
  return <MaterialCommunityIcons name="television" size={size} color={color} style={style} />;
};

export const SearchIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <MaterialIcons name="search" size={size} color={color} style={style} />;
};

export const DragHandleIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <MaterialIcons name="drag-handle" size={size} color={color} style={style} />;
};

export const TagIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="tags" color={color} size={size} style={style} />;
};
export const GenreIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <MaterialCommunityIcons name="tag-faces" color={color} size={size} style={style} />;
};

export const UnTagIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Entypo name="untag" color={color} size={size} style={style} />;
};

export const ShareIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Entypo name="share-alternative" size={size} color={color} style={style} />;
};

export const IMDBIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Fontisto name="imdb" size={size} color={color} style={style} />;
};
export const FilterIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return (
    <Feather
      name="filter"
      size={size}
      color={color}
      style={[
        style,
        {
          shadowColor: 'rgba(0,0,0, .4)',
          shadowOffset: { height: 1, width: 1 },
          shadowOpacity: 1,
          shadowRadius: 1,
        },
      ]}
    />
  );
};

export const CloseIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <AntDesign name="close" size={size} color={color} style={style} />;
};

export const DeleteIcon = ({ size = 25, color = '#b20a2c', style }: Props) => {
  return <AntDesign name="delete" size={size} color={color} style={style} />;
};

export const EraserIcon = ({ size = 25, color = undefined, style = undefined }: Props) => {
  return <MaterialCommunityIcons name="eraser" size={size} color={color} style={style} />;
};

export const RefreshIcon = ({ size = 25, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="refresh" size={size} color={color} style={style} />;
};
export const HardDriveIcon = ({ size = 25, color, style = {} }: Props) => {
  return <Feather name="hard-drive" size={size} color={color} style={style} />;
};

//OLD Check icon has circle around it
// export const CheckIcon = ({ size, color = undefined, style = undefined }: Props) => {
//   return (
//     <AntDesign name="checkcircleo" size={size} color={color} style={style} />
//   );
// };
// New Check icon has no circle around it
export const CheckIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="checkmark" color={color} size={size} style={style} />;
};

export const MenuIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="menu" size={size} color={color} style={style} />;
};

export const EditIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Feather name="edit" size={size} color={color} style={style} />;
};

export const HeartIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <AntDesign name="hearto" size={size} color={color} style={style} />;
};

export const ImagesIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome5 name="images" size={size} color={color} style={style} />;
};

export const CaretRightIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="caret-right" size={size} color={color} style={style} />;
};
export const CaretDownIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="caret-down" size={size} color={color} style={style} />;
};

//# More (down) Less (up) icons
export const MoreIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <AntDesign name="downcircleo" size={size} color={color} style={style} />;
};
export const LessIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <AntDesign name="upcircleo" size={size} color={color} style={style} />;
};

export const CheckedBox = ({ size, color = undefined, style = undefined }: Props) => {
  // return <FontAwesome5 name="sync-alt" size={size} color={color} style={style} />;
  return <MaterialIcons name="check-box" size={size} color={color} style={style} />;
};

export const UnCheckedBox = ({ size, color = undefined, style = undefined }: Props) => {
  // return <FontAwesome5 name="sync-alt" size={size} color={color} style={style} />;
  return <MaterialIcons name="check-box-outline-blank" size={size} color={color} style={style} />;
};
//# BACK button icon for headers in screens
export const BackIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <AntDesign name="back" size={size} color={color} style={style} />;
};
//----------------
//- Drawer Icons
//----------------
export const SignOutIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sign-out" color={color} size={size} style={style} />;
};
export const HomeIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="home" color={color} size={size} style={style} />;
};
export const SettingsIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="settings" color={color} size={size} style={style} />;
};
export const UserIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="user" color={color} size={size} style={style} />;
};
//Plus sign icon
export const AddIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome6 name="add" color={color} size={size} style={style} />;
};
export const EmptyMDHeartIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <MaterialCommunityIcons name="heart-outline" color={color} size={size} style={style} />;
};
export const MDHeartIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="heart" color={color} size={size} style={style} />;
};

// Other Icons

export const ThumbsUpIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="thumbs-up" color={color} size={size} style={style} />;
};

export const YouTubePlayIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="youtube-play" color={color} size={size} style={style} />;
};

export const SyncIcon = ({ size, color = undefined, style = undefined }: Props) => {
  // return <FontAwesome5 name="sync-alt" size={size} color={color} style={style} />;
  return <MaterialCommunityIcons name="cloud-sync" size={size} color={color} style={style} />;
};

export const CarouselIcon = ({ size, color = undefined, style = undefined }: Props) => {
  // return <FontAwesome5 name="sync-alt" size={size} color={color} style={style} />;
  return <MaterialIcons name="view-carousel" size={size} color={color} style={style} />;
};

export const ExpandDownIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return (
    <MaterialCommunityIcons name="arrow-expand-down" color={color} size={size} style={style} />
  );
};

export const CollapseUpIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return (
    <MaterialCommunityIcons name="arrow-collapse-up" color={color} size={size} style={style} />
  );
};

export const PowerIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Feather name="power" color={color} size={size} style={style} />;
};

//# Other Icons
export const InfoIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Feather name="info" color={color} size={size} style={style} />;
};
export const FlagIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="flag-o" color={color} size={size} style={style} />;
};

//# SORT Icons
export const AscAlphaIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-alpha-asc" color={color} size={size} style={style} />;
};
export const DescAlphaIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-alpha-desc" color={color} size={size} style={style} />;
};
export const AscNumIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-numeric-asc" color={color} size={size} style={style} />;
};
export const DescNumIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-numeric-desc" color={color} size={size} style={style} />;
};
export const AscOtherIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-amount-asc" color={color} size={size} style={style} />;
};
export const DescOtherIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <FontAwesome name="sort-amount-desc" color={color} size={size} style={style} />;
};

export const InfinityIcon = ({ size, color = undefined, style = undefined }: Props) => {
  return <Ionicons name="ios-infinite" size={size} color={color} style={style} />;
};
