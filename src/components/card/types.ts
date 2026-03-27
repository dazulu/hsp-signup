export type CardPadding = "sm" | "md";

export type CardProps = {
  children?: React.ReactNode;
  padding?: CardPadding;
  onPress?: () => void;
  span?: 1 | 2;
  title?: string;
  transparent?: boolean;
};

export type CardGridProps = {
  children: React.ReactNode;
  gap?: number;
};
