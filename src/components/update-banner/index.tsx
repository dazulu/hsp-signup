import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { useLocale } from "../../i18n";
import { theme } from "../../theme";
import { styles } from "./styles";
import type { UpdateBannerProps } from "./types";

export const UpdateBanner = ({
  visible,
  onPress,
  style,
}: UpdateBannerProps) => {
  const { t } = useLocale();

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <Ionicons
        name="arrow-down-circle"
        size={20}
        color={theme.colors.textOnPrimary}
      />
      <Text style={styles.text}>{t("update.available")}</Text>
    </Pressable>
  );
};
