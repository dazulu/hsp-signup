import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Alert, Platform, Pressable, Text } from "react-native";
import { useLocale } from "../../i18n";
import { getItemAsync, removeItemAsync } from "../../secure-store";
import { theme } from "../../theme";
import { styles } from "./styles";

const { colors } = theme;

const API_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
const USER_ID_KEY = "app_user_id";

export const DeleteLikesButton = () => {
  const { t } = useLocale();

  const deleteLikesData = useCallback(async () => {
    const userId = await getItemAsync(USER_ID_KEY);
    if (!userId) {
      Alert.alert(t("settings.deleteLikes"), t("settings.deleteLikes.success"));
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/likes?userId=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: { "x-api-key": API_KEY },
        },
      );

      if (!response.ok) {
        Alert.alert(t("settings.deleteLikes"), t("settings.deleteLikes.error"));
        return;
      }

      await removeItemAsync(USER_ID_KEY);
      Alert.alert(t("settings.deleteLikes"), t("settings.deleteLikes.success"));
    } catch {
      Alert.alert(t("settings.deleteLikes"), t("settings.deleteLikes.error"));
    }
  }, [t]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      t("settings.deleteLikes.confirm.title"),
      t("settings.deleteLikes.confirm.message"),
      [
        { text: t("settings.deleteLikes.confirm.cancel"), style: "cancel" },
        {
          text: t("settings.deleteLikes.confirm.delete"),
          style: "destructive",
          onPress: deleteLikesData,
        },
      ],
    );
  }, [t, deleteLikesData]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={confirmDelete}
      accessibilityRole="button"
      accessibilityLabel={t("settings.deleteLikes")}
    >
      <Ionicons name="trash-outline" size={14} color={colors.errorText} />
      <Text style={styles.label}>{t("settings.deleteLikes")}</Text>
    </Pressable>
  );
};
