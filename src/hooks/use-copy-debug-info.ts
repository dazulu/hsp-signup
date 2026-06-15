import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useLocale } from "../i18n";

const appVersion = Constants.expoConfig?.version ?? "—";

const STORAGE_KEYS = [
  "app_save_on_device",
  "hsp_sport",
  "hsp_triggered_at",
  "hsp_correlation_id",
  "hsp_last_booking",
  "app_strava_cache_v2",
  "app_contentful_events",
  "app_gallery_cache_en",
  "app_gallery_cache_de",
  "app_has_opened_before",
  "app_locale",
  "app_training_promo_dismissed",
  "app_training_reminder_prefs",
  "app_training_reminder_state",
  "app_contentful_quote",
  "app_whats_new_seen_version",
];

const CACHE_KEYS = new Set([
  "app_strava_cache_v2",
  "app_contentful_events",
  "app_gallery_cache_en",
  "app_gallery_cache_de",
  "app_contentful_quote",
]);

const summariseCacheValue = (storageValue: string): string => {
  try {
    const parsed = JSON.parse(storageValue) as { data: unknown };
    return Array.isArray(parsed.data) ? `${parsed.data.length} items` : "set";
  } catch {
    return "(invalid)";
  }
};

export const useCopyDebugInfo = (): (() => Promise<void>) => {
  const { t } = useLocale();

  return useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const pairs = await AsyncStorage.multiGet(STORAGE_KEYS);
    const storageLines = pairs
      .map(([storageKey, storageValue]) => {
        if (CACHE_KEYS.has(storageKey)) {
          const summary =
            storageValue == null ? "null" : summariseCacheValue(storageValue);
          return `  ${storageKey}: ${summary}`;
        }
        return storageValue != null ? `  ${storageKey}: ${storageValue}` : null;
      })
      .filter(Boolean)
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
};
