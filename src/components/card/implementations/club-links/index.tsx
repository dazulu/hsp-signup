import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, Text, View } from "react-native";
import { theme } from "../../../../theme";
import { Card } from "../../";
import { styles } from "./styles";
import type { ClubLink } from "./types";

const { colors } = theme;

const LINKS: ClubLink[] = [
  {
    label: "O'Neills Shop",
    href: "https://www.oneills.com/int_en/shop-by-team/gaa/europe/hamburg-gaa.html",
  },
  {
    label: "Club Merchandise",
    href: "https://hamburggaa.myspreadshop.de/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/hamburggaa/",
  },
  {
    label: "Boomerbook",
    href: "https://www.facebook.com/HamburgGAA/",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/hamburggaa/",
  },
];

export const ClubLinksCard = () => {
  return (
    <Card span={2} title="Links">
      <View style={styles.list}>
        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
            onPress={() => Linking.openURL(link.href)}
            accessibilityRole="link"
          >
            <Text style={styles.label} numberOfLines={1}>
              {link.label}
            </Text>
            <Ionicons name="open-outline" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
};
