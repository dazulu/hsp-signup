import Constants from "expo-constants";
import { useCallback } from "react";
import { Linking, Platform, Pressable, Switch, Text, View } from "react-native";
import { useTrainingReminders } from "../../hooks/use-training-reminders";
import { useLocale } from "../../i18n";
import { theme } from "../../theme";
import { Card } from "../card";
import { styles } from "./styles";

const { colors } = theme;

const openNotificationSettings = async () => {
  if (Platform.OS === "android") {
    const packageName = Constants.expoConfig?.android?.package;
    if (packageName) {
      try {
        await Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
          {
            key: "android.provider.extra.APP_PACKAGE",
            value: packageName,
          },
        ]);
        return;
      } catch {
        // Fall through to the generic app-info screen.
      }
    }
  }
  await Linking.openSettings();
};

export const TrainingReminderSettings = () => {
  const { t } = useLocale();
  const { ready, preferences, permissionStatus, setEnabled } =
    useTrainingReminders();

  const permissionDenied = permissionStatus === "denied";
  const disabled = !ready || permissionDenied;
  // When permission is denied the OS will not deliver anything, so reflect the
  // effective state in the UI. The stored preferences are kept untouched, so
  // the toggles will visibly snap back on the moment the user grants
  // permission and returns to the app.
  const footballValue = preferences.football && !permissionDenied;
  const hurlingValue = preferences.hurling && !permissionDenied;

  const handleOpenSettings = useCallback(() => {
    openNotificationSettings();
  }, []);

  return (
    <Card>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          {t("settings.reminders.sectionTitle")}
        </Text>
        <Text style={styles.helper}>{t("settings.reminders.helper")}</Text>

        {permissionDenied ? (
          <View style={styles.blockedContainer}>
            <Text style={styles.blockedNotice}>
              {t("settings.reminders.permissionBlocked")}
            </Text>
            <Pressable
              onPress={handleOpenSettings}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.openSettingsButton,
                pressed && styles.openSettingsButtonPressed,
              ]}
            >
              <Text style={styles.openSettingsLabel}>
                {t("settings.reminders.openSettings")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {t("settings.reminders.football.label")}
          </Text>
          <Switch
            value={footballValue}
            onValueChange={(value) => {
              setEnabled("football", value);
            }}
            disabled={disabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {t("settings.reminders.hurling.label")}
          </Text>
          <Switch
            value={hurlingValue}
            onValueChange={(value) => {
              setEnabled("hurling", value);
            }}
            disabled={disabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>
    </Card>
  );
};
