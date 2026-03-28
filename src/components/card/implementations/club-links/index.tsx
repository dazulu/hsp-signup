import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocale } from "../../../../i18n";
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
  const { t } = useLocale();

  return (
    <Card span={2} title={t("card.links.title")}>
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
