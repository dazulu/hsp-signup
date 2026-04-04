import type { ReactNode } from "react";
import type {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

export type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children?: ReactNode;
};

export type ScreenLayoutContextValue = {
  headerHeight: number;
  contentPaddingTop: number;
  scrollY: Animated.Value;
  onScrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  resetScrollY: () => void;
};
