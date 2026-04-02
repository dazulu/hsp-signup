import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View, type ViewStyle } from "react-native";
import { theme } from "../../theme";

const { colors, space } = theme;

import { styles } from "./styles";
import type { CardProps } from "./types";

const SPAN_STYLES: Record<1 | 2, ViewStyle> = {
  1: { flex: 1 },
  2: { flexBasis: "100%" },
};

const PADDING: Record<"sm" | "md", number> = { sm: space[16], md: space[28] };
const TRANSPARENT_PADDING: Record<"sm" | "md", number> = {
  sm: space[8],
  md: space[14],
};

export const Card = ({
  backgroundImage,
  children,
  title,
  padding = "sm",
  onPress,
  span,
  transparent = false,
  variant,
}: CardProps) => {
  const spanStyle = span != null ? SPAN_STYLES[span] : undefined;

  const cardStyle: ViewStyle[] = [
    styles.card,
    ...(transparent ? [styles.cardTransparent] : []),
    ...(variant === "notice" ? [styles.cardNotice] : []),
    ...(spanStyle ? [spanStyle] : []),
    transparent
      ? {
          paddingHorizontal: PADDING[padding],
          paddingVertical: TRANSPARENT_PADDING[padding],
        }
      : { padding: PADDING[padding] },
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.9 : 1 }]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {backgroundImage ? (
          <Image
            source={backgroundImage}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        ) : null}
        {title ? (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {transparent ? (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.textMuted}
              />
            ) : null}
          </View>
        ) : null}
        {children}
        {!transparent ? (
          <View style={styles.caret}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.textMuted}
            />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {backgroundImage ? (
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
};
