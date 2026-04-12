import type { ImageSourcePropType } from "react-native";

export type CardPadding = "sm" | "md";

export type CardProps = {
  backgroundImage?: ImageSourcePropType;
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  padding?: CardPadding;
  span?: 1 | 2;
  title?: string;
  tooltipText?: string;
  transparent?: boolean;
  variant?: "notice";
};

export type CardGridProps = {
  children: React.ReactNode;
  gap?: number;
};
