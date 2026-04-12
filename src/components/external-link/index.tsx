import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, Text } from "react-native";
import { theme } from "../../theme";
import { styles } from "./styles";
import type { ExternalLinkProps } from "./types";

const { colors } = theme;

export const ExternalLink = ({ label, href, style }: ExternalLinkProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        style,
        pressed && styles.itemPressed,
      ]}
      onPress={() => Linking.openURL(href)}
      accessibilityRole="link"
    >
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </Pressable>
  );
};
