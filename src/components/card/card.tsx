import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, Text, View, type ViewStyle } from "react-native";
import { theme } from "../../theme";
import { TooltipModal } from "../modal";
import { styles } from "./styles";
import type { CardProps } from "./types";

const { colors, space } = theme;

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
  gradient,
  title,
  padding = "sm",
  onPress,
  onLongPress,
  delayLongPress,
  span,
  tooltipText,
  tooltipLinkUrl,
  tooltipLinkText,
  transparent = false,
  variant,
}: CardProps) => {
  const spanStyle = span != null ? SPAN_STYLES[span] : undefined;

  const cardStyle: ViewStyle[] = [
    styles.card,
    ...(transparent ? [styles.cardTransparent] : []),
    ...(variant === "notice" ? [styles.cardNotice] : []),
    ...(gradient ? [styles.cardGradient] : []),
    ...(spanStyle ? [spanStyle] : []),
    transparent
      ? {
          paddingHorizontal: PADDING[padding],
          paddingVertical: TRANSPARENT_PADDING[padding],
        }
      : { padding: PADDING[padding] },
  ];

  const titleStyle = gradient ? styles.titleOnGradient : styles.title;

  const tooltipIcon = tooltipText ? (
    <TooltipModal
      text={tooltipText}
      linkUrl={tooltipLinkUrl}
      linkText={tooltipLinkText}
    />
  ) : null;

  if (onPress || onLongPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.9 : 1 }]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={delayLongPress}
        accessibilityRole="button"
      >
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          />
        ) : null}
        {backgroundImage ? (
          <Image
            source={backgroundImage}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        ) : null}
        {title ? (
          <View style={styles.titleRow}>
            <Text style={titleStyle}>{title}</Text>
            {tooltipIcon}
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
        {onPress && !transparent ? (
          <View style={styles.caret}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={gradient ? "white" : colors.textMuted}
            />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        />
      ) : null}
      {backgroundImage ? (
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      ) : null}
      {title ? (
        tooltipText ? (
          <View style={styles.titleRow}>
            <Text style={titleStyle}>{title}</Text>
            {tooltipIcon}
          </View>
        ) : (
          <Text style={titleStyle}>{title}</Text>
        )
      ) : null}
      {children}
    </View>
  );
};
