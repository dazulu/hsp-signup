import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, type ViewStyle } from "react-native";
import { styles } from "./styles";
import type { CardProps } from "./types";

const SPAN_STYLES: Record<1 | 2, ViewStyle> = {
  1: { flexBasis: "48%", flexGrow: 1, flexShrink: 0 },
  2: { flexBasis: "100%" },
};

export const Card = ({ children, padding = 28, onPress, span }: CardProps) => {
  const spanStyle = span != null ? SPAN_STYLES[span] : undefined;

  const cardStyle: ViewStyle[] = [
    styles.card,
    ...(spanStyle ? [spanStyle] : []),
    { padding },
    ...(onPress ? [styles.cardPressable] : []),
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.9 : 1 }]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {children}
        <View style={styles.caret}>
          <Ionicons name="chevron-forward" size={20} color="#4A6CF7" />
        </View>
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
