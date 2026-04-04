import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageSwitcher } from "../components/language-switcher";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { styles } from "./settings.styles";

const { space } = theme;

const appVersion = Constants.expoConfig?.version ?? "—";

const STORAGE_KEYS = [
  "app_save_on_device",
  "hsp_sport",
  "hsp_triggered_at",
  "hsp_correlation_id",
  "hsp_last_booking",
  "app_strava_cache",
  "app_contentful_events",
  "app_gallery_cache_en",
  "app_gallery_cache_de",
  "app_has_opened_before",
  "app_locale",
];

const SettingsScrollContent = () => {
  const { headerHeight, contentPaddingTop, onScrollHandler } =
    useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();

  const copyDebugInfo = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const pairs = await AsyncStorage.multiGet(STORAGE_KEYS);
    const storageLines = pairs
      .filter(([, storageValue]) => storageValue != null)
      .map(([storageKey, storageValue]) => `  ${storageKey}: ${storageValue}`)
      .join("\n");

    const brand = Device.brand ?? "";
    const model = Device.modelName ?? "unknown";
    const deviceLabel = brand ? `${brand} ${model}` : model;

    const lines = [
      `Device: ${deviceLabel}`,
      `OS: ${Platform.OS} ${Device.osVersion ?? Platform.Version}`,
      `App Version: ${appVersion}`,
      `OTA Update: ${Updates.updateId ?? "embedded"}`,
      Updates.createdAt ? `OTA Date: ${Updates.createdAt.toISOString()}` : "",
      `Runtime Version: ${Updates.runtimeVersion ?? "—"}`,
      `Channel: ${Updates.channel ?? "—"}`,
      storageLines ? `Storage:\n${storageLines}` : "Storage: (empty)",
    ].filter(Boolean);

    await Clipboard.setStringAsync(lines.join("\n"));
    Alert.alert(t("settings.version"), t("settings.debugCopied"));
  }, [t]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: contentPaddingTop, paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
    >
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.language")}</Text>
          <LanguageSwitcher />
        </View>
      </View>

      <Pressable
        style={styles.section}
        onLongPress={copyDebugInfo}
        delayLongPress={500}
        accessibilityRole="button"
        accessibilityLabel={t("settings.version")}
      >
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.version")}</Text>
          <Text style={styles.rowValue}>{appVersion}</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
};

export const SettingsScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <SettingsScrollContent />
    </ScreenLayout>
  );
};
