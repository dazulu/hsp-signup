import type { ImageSourcePropType } from "react-native";

export type CardPadding = "sm" | "md";

export type CardProps = {
  backgroundImage?: ImageSourcePropType;
  children?: React.ReactNode;
  padding?: CardPadding;
  onPress?: () => void;
  span?: 1 | 2;
  title?: string;
  transparent?: boolean;
  variant?: "notice";
};

export type CardGridProps = {
  children: React.ReactNode;
  gap?: number;
};
