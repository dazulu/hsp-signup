import { View } from "react-native";
import { styles } from "./styles";
import type { CardGridProps } from "./types";

export const CardGrid = ({ children, gap = 16 }: CardGridProps) => {
  return <View style={[styles.cardGrid, { gap }]}>{children}</View>;
};
