export type CardProps = {
  children: React.ReactNode;
  padding?: number;
  onPress?: () => void;
  span?: 1 | 2;
};

export type CardGridProps = {
  children: React.ReactNode;
  gap?: number;
};
