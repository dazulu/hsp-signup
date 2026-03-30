import type { ViewStyle } from "react-native";

export type UpdateBannerProps = {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
};
