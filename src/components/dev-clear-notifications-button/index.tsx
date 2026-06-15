import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Alert, Pressable, Text } from "react-native";
import { clearAllTrainingReminders } from "../../services/notifications";
import { theme } from "../../theme";
import { Card } from "../card";
import { styles } from "./styles";

const { colors } = theme;

export const DevClearNotificationsButton = () => {
  const clearAll = useCallback(async () => {
    try {
      await clearAllTrainingReminders();
      Alert.alert(
        "Dev: notifications cleared",
        "All scheduled training reminders have been cancelled and the stored schedule state reset. The next reconcile will reschedule based on current preferences.",
      );
    } catch (error) {
      Alert.alert("Dev: clear failed", String(error));
    }
  }, []);

  const confirm = useCallback(() => {
    Alert.alert(
      "Dev: clear scheduled alerts?",
      "Cancels every OS-scheduled training reminder and resets the stored schedule state. Preferences are kept — the next reconcile will reschedule.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearAll },
      ],
    );
  }, [clearAll]);

  return (
    <Card>
      <Pressable
        onPress={confirm}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.errorText} />
        <Text style={styles.label}>Dev: clear scheduled alerts</Text>
      </Pressable>
    </Card>
  );
};
